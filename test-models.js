// ===============================================
// test-models.js - Test all new models
// RUN FROM ROOT DIRECTORY: node test-models.js
// ===============================================

import mongoose from 'mongoose';
import { config } from 'dotenv';

// FIX: Import from correct path based on current directory
import {
  User,
  Course,
  Unit,
  Lesson,
  ExerciseTemplate,
  Vocabulary,
  UserVocabularyProgress,
  PersonalExerciseBank
} from './server/data/models/index.js';

config();

async function testModels() {
  try {
    console.log('🧪 Testing LinguaLeap Models...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear test data first to avoid duplicates
    console.log('🧹 Clearing test data...');
    await User.deleteMany({ email: { $in: ['test@lingualeap.com', 'admin@test.com'] } });
    await Course.deleteMany({ title: 'Bắt đầu với tiếng Anh' });
    await Unit.deleteMany({ title: 'Chào hỏi & Giới thiệu' });
    await Lesson.deleteMany({ title: 'Basic Greetings' });
    await ExerciseTemplate.deleteMany({ exercise_type: 'multiple_choice' });
    await Vocabulary.deleteMany({ word: 'hello' });
    await UserVocabularyProgress.deleteMany({});
    await PersonalExerciseBank.deleteMany({});
    console.log('✅ Test data cleared\n');
    
    // Test 1: Create Sample Vocabulary
    console.log('1️⃣ Testing Vocabulary Model...');
    const vocabulary = new Vocabulary({
      word: 'hello',
      meaning: 'xin chào',
      pronunciation: '/həˈloʊ/',
      difficulty: 'beginner',
      part_of_speech: 'interjection',
      theme_categories: ['greetings_intro'],
      tags: ['greeting', 'common', 'daily'],
      definitions: [{
        context: 'greeting',
        meaning: 'lời chào hỏi thân thiện',
        example: {
          sentence: 'Hello, how are you?',
          translation: 'Xin chào, bạn khỏe không?'
        }
      }],
      frequency_score: 95
    });
    
    await vocabulary.save();
    console.log('✅ Vocabulary saved:', vocabulary.word);
    
    // Test 2: Create Sample Course
    console.log('\n2️⃣ Testing Course Model...');
    const course = new Course({
      title: 'Bắt đầu với tiếng Anh',
      description: 'Khóa học cơ bản cho người mới bắt đầu',
      category: 'basic_communication',
      skill_focus: ['vocabulary', 'grammar'],
      estimated_duration: 20,
      challenge_test: {
        total_questions: 25,
        pass_percentage: 80,
        must_correct_questions: [1, 5, 10, 15, 20],
        time_limit: 30
      },
      is_published: true,
      created_by: new mongoose.Types.ObjectId()
    });
    
    await course.save();
    console.log('✅ Course saved:', course.title);
    
    // Test 3: Create Sample Unit
    console.log('\n3️⃣ Testing Unit Model...');
    const unit = new Unit({
      title: 'Chào hỏi & Giới thiệu',
      description: 'Học cách chào hỏi và giới thiệu bản thân',
      course_id: course._id,
      theme: 'greetings_intro',
      estimated_duration: 120,
      challenge_test: {
        total_questions: 15,
        pass_percentage: 80,
        must_correct_questions: [2, 7, 12],
        time_limit: 20
      },
      is_published: true,
      sort_order: 1
    });
    
    await unit.save();
    console.log('✅ Unit saved:', unit.title);
    
    // Test 4: Create Sample Lesson
    console.log('\n4️⃣ Testing Lesson Model...');
    const lesson = new Lesson({
      title: 'Basic Greetings',
      description: 'Học các cách chào hỏi cơ bản',
      course_id: course._id,
      unit_id: unit._id,
      lesson_type: 'vocabulary',
      objective: 'Học cách chào hỏi trong các tình huống khác nhau',
      vocabulary_pool: [{
        vocabulary_id: vocabulary._id,
        context_in_lesson: 'basic greeting',
        is_main_focus: true,
        introduction_order: 1,
        difficulty_weight: 3
      }],
      lesson_context: {
        situation: 'meeting new people',
        cultural_context: 'Vietnamese social customs',
        use_cases: ['formal greeting', 'casual greeting'],
        avoid_topics: ['romantic', 'political']
      },
      grammar_point: {
        title: 'Simple Greetings',
        explanation: 'Cách sử dụng hello trong giao tiếp',
        pattern: 'Hello + name/title',
        examples: ['Hello John', 'Hello teacher']
      },
      exercise_generation: {
        total_exercises: 7,
        exercise_distribution: {
          multiple_choice: 2,
          fill_blank: 2,
          listening: 1,
          translation: 1,
          word_matching: 1
        },
        difficulty_progression: true,
        vocabulary_coverage: 'all'
      },
      estimated_duration: 15,
      xp_reward: 10,
      is_published: true,
      sort_order: 1
    });
    
    await lesson.save();
    console.log('✅ Lesson saved:', lesson.title);
    
    // Test 5: Create Sample Exercise Template
    console.log('\n5️⃣ Testing Exercise Template Model...');
    const exerciseTemplate = new ExerciseTemplate({
      exercise_type: 'multiple_choice',
      type_display_name: 'Chọn đáp án đúng',
      description: 'Chọn đáp án đúng từ 4 lựa chọn',
      prompt_template: {
        system_context: 'Bạn là giáo viên tiếng Anh chuyên nghiệp cho người Việt Nam level {user_level}. Bạn tạo bài tập {exercise_type} phù hợp văn hóa Việt Nam.',
        main_prompt: 'Tạo câu hỏi multiple choice cho từ "{word}" nghĩa "{meaning}" trong ngữ cảnh "{lesson_context}". Yêu cầu: - Câu hỏi thực tế, dễ hiểu - 4 đáp án: 1 đúng, 3 sai hợp lý - Phù hợp tình huống {situation}. Trả về JSON format: {json_structure}',
        variables: ['word', 'meaning', 'lesson_context', 'user_level', 'situation', 'json_structure'],
        expected_output_format: {
          question: 'string',
          options: ['string1', 'string2', 'string3', 'string4'],
          correct_index: 'number',
          explanation: 'string'
        },
        fallback_template: {
          question: 'What does "{word}" mean in Vietnamese?',
          options: ['{meaning}', 'wrong answer 1', 'wrong answer 2', 'wrong answer 3'],
          correct_index: 0,
          explanation: '{word} means {meaning} in Vietnamese.'
        }
      },
      generation_rules: {
        max_attempts: 3,
        validation_rules: ['check_json_format', 'check_appropriate_content'],
        difficulty_adaptation: true,
        content_filters: ['family_friendly', 'cultural_appropriate']
      },
      skill_focus: ['vocabulary'],
      estimated_time: 30,
      requires_audio: false,
      requires_microphone: false,
      difficulty_levels: ['beginner', 'intermediate'],
      is_active: true
    });
    
    await exerciseTemplate.save();
    console.log('✅ Exercise Template saved:', exerciseTemplate.exercise_type);
    
    // Test 6: Create Sample User
    console.log('\n6️⃣ Testing User Model...');
    const user = new User({
      username: 'testuser123',
      email: 'test@lingualeap.com',
      password: 'password123',
      displayName: 'Test User',
      language_profile: {
        native_language: 'vi',
        target_language: 'en',
        current_level: 'beginner',
        learning_goals: ['daily_communication', 'travel_english'],
        preferred_skills: ['vocabulary', 'listening']
      },
      gamification: {
        total_xp: 150,
        current_level: 2,
        hearts: {
          current: 5,
          last_refill: new Date()
        },
        streak: {
          current: 3,
          longest: 5,
          last_activity: new Date()
        }
      }
    });
    
    await user.save();
    console.log('✅ User saved:', user.username);
    
    // Test 7: Create Sample User Vocabulary Progress
    console.log('\n7️⃣ Testing User Vocabulary Progress Model...');
    const userVocabProgress = new UserVocabularyProgress({
      user_id: user._id,
      vocabulary_id: vocabulary._id,
      mastery_level: 'learning',
      correct_answers: 3,
      total_attempts: 5,
      first_learned_lesson: lesson._id,
      lesson_encounters: [{
        lesson_id: lesson._id,
        date: new Date(),
        context: 'main_focus',
        performance: {
          correct: 3,
          total: 5
        }
      }],
      spaced_repetition: {
        interval: 2,
        ease_factor: 2.5,
        repetitions: 1,
        last_reviewed: new Date(),
        next_review_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    });
    
    await userVocabProgress.save();
    console.log('✅ User Vocabulary Progress saved');
    
    // Test 8: Create Sample Personal Exercise Bank
    console.log('\n8️⃣ Testing Personal Exercise Bank Model...');
    const personalExercise = new PersonalExerciseBank({
      user_id: user._id,
      exercise_content: {
        question: 'What does "hello" mean in Vietnamese?',
        options: ['xin chào', 'tạm biệt', 'cảm ơn', 'xin lỗi'],
        correct_index: 0,
        explanation: 'Hello means xin chào in Vietnamese.'
      },
      exercise_type: 'multiple_choice',
      source_lesson_id: lesson._id,
      vocabulary_focus: [vocabulary._id],
      lesson_context: {
        situation: 'meeting new people',
        theme: 'greetings_intro',
        difficulty: 'beginner'
      },
      performance: 'correct',
      time_taken: 25,
      user_response: {
        selected_index: 0
      },
      ai_generation_info: {
        model_used: 'claude-3-5-sonnet-20241022',
        generation_time: 1.2,
        fallback_used: false
      }
    });
    
    await personalExercise.save();
    console.log('✅ Personal Exercise Bank saved');
    
    // Test 9: Test Model Relationships & Methods
    console.log('\n9️⃣ Testing Model Relationships & Methods...');
    
    // Test vocabulary search
    const searchResults = await Vocabulary.searchWords('hello', { difficulty: 'beginner' });
    console.log('✅ Vocabulary search works:', searchResults.length, 'results');
    
    // Test user methods
    user.addXP(50);
    user.updateStreak();
    user.refillHearts();
    console.log('✅ User methods work - XP:', user.gamification.total_xp, 'Level:', user.gamification.current_level);
    
    // Test vocabulary progress methods
    userVocabProgress.updateProgress('multiple_choice', true, 4);
    console.log('✅ Progress methods work - Success rate:', userVocabProgress.success_rate + '%');
    
    // Test exercise template methods
    const promptWithVars = exerciseTemplate.getPromptWithVariables({
      word: 'hello',
      meaning: 'xin chào',
      lesson_context: 'greeting',
      user_level: 'beginner',
      situation: 'meeting new people',
      json_structure: JSON.stringify(exerciseTemplate.prompt_template.expected_output_format)
    });
    console.log('✅ Exercise template methods work');
    
    // Test aggregation queries
    const vocabStats = await UserVocabularyProgress.getUserStats(user._id);
    console.log('✅ Aggregation queries work:', vocabStats.length, 'stats');
    
    console.log('\n🎉 ALL MODELS TESTED SUCCESSFULLY!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Vocabulary Model - PASSED');
    console.log('   ✅ Course Model - PASSED');
    console.log('   ✅ Unit Model - PASSED');
    console.log('   ✅ Lesson Model - PASSED');
    console.log('   ✅ Exercise Template Model - PASSED');
    console.log('   ✅ User Model - PASSED');
    console.log('   ✅ User Vocabulary Progress Model - PASSED');
    console.log('   ✅ Personal Exercise Bank Model - PASSED');
    console.log('   ✅ Model Relationships - PASSED');
    console.log('   ✅ Model Methods - PASSED');
    console.log('   ✅ Aggregation Queries - PASSED');
    
    console.log('\n🚀 Ready for GraphQL integration!');
    
  } catch (error) {
    console.error('❌ Model test failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run tests
testModels();