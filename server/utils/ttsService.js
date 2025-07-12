// ===============================================
// TTS SERVICE - GOOGLE TEXT-TO-SPEECH INTEGRATION
// ===============================================

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Google Cloud TTS client
const ttsClient = new TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

// ===============================================
// TTS CONFIGURATION
// ===============================================

const VOICE_CONFIGS = {
  // English voices
  'en-US': {
    languageCode: 'en-US',
    name: 'en-US-Standard-A',
    ssmlGender: 'FEMALE'
  },
  'en-GB': {
    languageCode: 'en-GB',
    name: 'en-GB-Standard-A',
    ssmlGender: 'FEMALE'
  },
  'en-AU': {
    languageCode: 'en-AU',
    name: 'en-AU-Standard-A',
    ssmlGender: 'FEMALE'
  },
  
  // Vietnamese voices (if available)
  'vi-VN': {
    languageCode: 'vi-VN',
    name: 'vi-VN-Standard-A',
    ssmlGender: 'FEMALE'
  }
};

const AUDIO_CONFIG = {
  audioEncoding: 'MP3',
  speakingRate: 0.9, // Slightly slower for learners
  pitch: 0.0,
  volumeGainDb: 0.0
};

// ===============================================
// TTS SERVICE FUNCTIONS
// ===============================================

export class TTSService {
  
  // Generate audio for text
  static async generateAudio(text, options = {}) {
    try {
      console.log('🔊 Generating audio for:', text.substring(0, 50) + '...');
      
      const {
        language = 'en-US',
        voiceName = null,
        speakingRate = 0.9,
        pitch = 0.0,
        volumeGainDb = 0.0
      } = options;
      
      // Get voice configuration
      const voiceConfig = voiceName ? 
        { languageCode: language, name: voiceName, ssmlGender: 'FEMALE' } :
        VOICE_CONFIGS[language] || VOICE_CONFIGS['en-US'];
      
      // Prepare request
      const request = {
        input: { text },
        voice: voiceConfig,
        audioConfig: {
          ...AUDIO_CONFIG,
          speakingRate,
          pitch,
          volumeGainDb
        }
      };
      
      // Call Google TTS API
      const [response] = await ttsClient.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content received from TTS service');
      }
      
      console.log('✅ Audio generated successfully');
      return response.audioContent;
      
    } catch (error) {
      console.error('❌ Error generating audio:', error.message);
      throw error;
    }
  }
  
  // Generate audio and save to file
  static async generateAudioFile(text, filename, options = {}) {
    try {
      const audioContent = await this.generateAudio(text, options);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'audio');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Save audio file
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, audioContent, 'binary');
      
      console.log('💾 Audio file saved:', filePath);
      return filePath;
      
    } catch (error) {
      console.error('❌ Error saving audio file:', error.message);
      throw error;
    }
  }
  
  // Generate audio URL for exercise
  static async generateExerciseAudio(exerciseType, content, options = {}) {
    try {
      let audioText = '';
      let filename = '';
      
      switch (exerciseType) {
        case 'listening':
          audioText = content.audio_text || content.question || '';
          filename = `listening_${Date.now()}.mp3`;
          break;
          
        case 'listen_choose':
          audioText = content.audio_text || '';
          filename = `listen_choose_${Date.now()}.mp3`;
          break;
          
        case 'speak_repeat':
          audioText = content.text_to_speak || '';
          filename = `speak_repeat_${Date.now()}.mp3`;
          break;
          
        case 'multiple_choice':
          audioText = content.question || '';
          filename = `multiple_choice_${Date.now()}.mp3`;
          break;
          
        case 'fill_blank':
          audioText = content.sentence || '';
          filename = `fill_blank_${Date.now()}.mp3`;
          break;
          
        default:
          audioText = content.question || content.text || '';
          filename = `${exerciseType}_${Date.now()}.mp3`;
      }
      
      if (!audioText) {
        console.warn('⚠️ No audio text found for exercise type:', exerciseType);
        return null;
      }
      
      const filePath = await this.generateAudioFile(audioText, filename, options);
      const audioUrl = `/uploads/audio/${filename}`;
      
      return {
        audioUrl,
        filePath,
        text: audioText
      };
      
    } catch (error) {
      console.error('❌ Error generating exercise audio:', error.message);
      return null;
    }
  }
  
  // Generate audio for vocabulary word
  static async generateVocabularyAudio(word, meaning, options = {}) {
    try {
      const filename = `vocab_${word.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp3`;
      const filePath = await this.generateAudioFile(word, filename, options);
      const audioUrl = `/uploads/audio/${filename}`;
      
      return {
        audioUrl,
        filePath,
        word,
        meaning
      };
      
    } catch (error) {
      console.error('❌ Error generating vocabulary audio:', error.message);
      return null;
    }
  }
  
  // Generate audio for lesson introduction
  static async generateLessonAudio(lesson, options = {}) {
    try {
      const introText = lesson.introduction?.text || lesson.title;
      const filename = `lesson_${lesson._id}_${Date.now()}.mp3`;
      const filePath = await this.generateAudioFile(introText, filename, options);
      const audioUrl = `/uploads/audio/${filename}`;
      
      return {
        audioUrl,
        filePath,
        text: introText
      };
      
    } catch (error) {
      console.error('❌ Error generating lesson audio:', error.message);
      return null;
    }
  }
  
  // Batch generate audio for multiple exercises
  static async generateBatchAudio(exercises, options = {}) {
    try {
      console.log('🔊 Generating batch audio for', exercises.length, 'exercises');
      
      const results = [];
      
      for (const exercise of exercises) {
        if (exercise.requires_audio || ['listening', 'listen_choose', 'speak_repeat'].includes(exercise.type)) {
          const audioResult = await this.generateExerciseAudio(
            exercise.type, 
            exercise.content, 
            options
          );
          
          if (audioResult) {
            results.push({
              exerciseId: exercise._id,
              type: exercise.type,
              audioUrl: audioResult.audioUrl,
              text: audioResult.text
            });
          }
        }
      }
      
      console.log(`✅ Generated audio for ${results.length} exercises`);
      return results;
      
    } catch (error) {
      console.error('❌ Error generating batch audio:', error.message);
      throw error;
    }
  }
  
  // Get available voices
  static async getAvailableVoices(languageCode = null) {
    try {
      const request = {
        languageCode: languageCode || 'en-US'
      };
      
      const [response] = await ttsClient.listVoices(request);
      return response.voices || [];
      
    } catch (error) {
      console.error('❌ Error getting available voices:', error.message);
      return [];
    }
  }
  
  // Validate text for TTS
  static validateText(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Text is required and must be a string' };
    }
    
    if (text.length > 5000) {
      return { valid: false, error: 'Text is too long (max 5000 characters)' };
    }
    
    if (text.trim().length === 0) {
      return { valid: false, error: 'Text cannot be empty' };
    }
    
    return { valid: true };
  }
  
  // Clean up old audio files
  static async cleanupOldFiles(daysOld = 7) {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'audio');
      if (!fs.existsSync(uploadsDir)) {
        return;
      }
      
      const files = fs.readdirSync(uploadsDir);
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
      
      console.log(`🧹 Cleaned up ${deletedCount} old audio files`);
      
    } catch (error) {
      console.error('❌ Error cleaning up old files:', error.message);
    }
  }
}

export default TTSService; 