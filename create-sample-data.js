// ===============================================
// create-sample-data.js - Create comprehensive sample data
// ===============================================

import mongoose from 'mongoose';
import { config } from 'dotenv';
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

async function createSampleData() {
  try {
    console.log('🌱 Creating LinguaLeap Sample Data...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Course.deleteMany({}),
      Unit.deleteMany({}),
      Lesson.deleteMany({}),
      ExerciseTemplate.deleteMany({}),
      Vocabulary.deleteMany({}),
      UserVocabularyProgress.deleteMany({}),
      PersonalExerciseBank.deleteMany({})
    ]);
    console.log('✅ Existing data cleared\n');
    
    // 1. Create Exercise Templates (9 types)
    console.log('1️⃣ Creating Exercise Templates...');
    const exerciseTemplates = [
      {
        exercise_type: 'multiple_choice',
        type_display_name: 'Chọn đáp án đúng',
        description: 'Chọn đáp án đúng từ 4 lựa chọn',
        prompt_template: {
          system_context: 'You are a professional English teacher for Vietnamese learners at {user_level} level. Create culturally appropriate {exercise_type} exercises.',
          main_prompt: 'Create a multiple choice question for the word "{word}" meaning "{meaning}" in the context of "{lesson_context}". Requirements: - Practical, clear question - 4 options: 1 correct, 3 plausible wrong answers - Suitable for situation: {situation}. Return JSON format: {json_structure}',
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
        difficulty_levels: ['beginner', 'intermediate', 'advanced']
      },
      {
        exercise_type: 'fill_blank',
        type_display_name: 'Điền từ vào chỗ trống',
        description: 'Điền từ thích hợp vào chỗ trống trong câu',
        prompt_template: {
          system_context: 'You are a professional English teacher for Vietnamese learners at {user_level} level.',
          main_prompt: 'Create a fill-in-the-blank exercise using "{word}" meaning "{meaning}". Context: {lesson_context}, Situation: {situation}. Return JSON: {json_structure}',
          variables: ['word', 'meaning', 'lesson_context', 'situation', 'json_structure'],
          expected_output_format: {
            sentence: 'string with _____ blank',
            correct_word: 'string',
            translation: 'string',
            alternatives: ['alternative1', 'alternative2']
          },
          fallback_template: {
            sentence: 'I need to learn the word _____.',
            correct_word: '{word}',
            translation: 'Tôi cần học từ _____.',
            alternatives: []
          }
        },
        generation_rules: {
          max_attempts: 3,
          validation_rules: ['check_json_format', 'check_appropriate_content'],
          difficulty_adaptation: true,
          content_filters: ['family_friendly']
        },
        skill_focus: ['vocabulary', 'grammar'],
        estimated_time: 45,
        requires_audio: false,
        difficulty_levels: ['beginner', 'intermediate', 'advanced']
      },
      {
        exercise_type: 'listening',
        type_display_name: 'Bài tập nghe',
        description: 'Nghe audio và trả lời câu hỏi',
        prompt_template: {
          system_context: 'You are a professional English teacher for Vietnamese learners.',
          main_prompt: 'Create a listening exercise using "{word}" meaning "{meaning}". Create a natural sentence for audio and a comprehension question. Return JSON: {json_structure}',
          variables: ['word', 'meaning', 'json_structure'],
          expected_output_format: {
            audio_text: 'string',
            question: 'string',
            options: ['option1', 'option2', 'option3'],
            correct_index: 'number'
          },
          fallback_template: {
            audio_text: 'The word is {word}.',
            question: 'What word did you hear?',
            options: ['{word}', 'other word 1', 'other word 2'],
            correct_index: 0
          }
        },
        generation_rules: {
          max_attempts: 3,
          validation_rules: ['check_json_format'],
          difficulty_adaptation: true,
          content_filters: ['family_friendly']
        },
        skill_focus: ['listening', 'vocabulary'],
        estimated_time: 60,
        requires_audio: true,
        difficulty_levels: ['beginner', 'intermediate', 'advanced']
      },
      {
        exercise_type: 'translation',
        type_display_name: 'Dịch câu',
        description: 'Dịch từ tiếng Việt sang tiếng Anh hoặc ngược lại',
        prompt_template: {
          system_context: 'You are a professional English teacher for Vietnamese learners.',
          main_prompt: 'Create translation exercises for "{word}" meaning "{meaning}". Create both Vietnamese to English and English to Vietnamese. Return JSON: {json_structure}',
          variables: ['word', 'meaning', 'json_structure'],
          expected_output_format: {
            vn_to_en: {
              vietnamese: 'string',
              english: 'string'
            },
            en_to_vn: {
              english: 'string',
              vietnamese: 'string'
            }
          },
          fallback_template: {
            vn_to_en: {
              vietnamese: 'Từ này là {meaning}.',
              english: 'This word is {word}.'
            },
            en_to_vn: {
              english: 'The word {word} is important.',
              vietnamese: 'Từ {word} rất quan trọng.'
            }
          }
        },
        generation_rules: {
          max_attempts: 3,
          validation_rules: ['check_json_format'],
          difficulty_adaptation: true,
          content_filters: ['family_friendly']
        },
        skill_focus: ['vocabulary', 'translation'],
        estimated_time: 90,
        requires_audio: false,
        difficulty_levels: ['beginner', 'intermediate', 'advanced']
      },
      {
        exercise_type: 'word_matching',
        type_display_name: 'Ghép từ',
        description: 'Ghép từ tiếng Anh với nghĩa tiếng Việt',
        prompt_template: {
          system_context: 'You are creating word matching exercises for Vietnamese English learners.',
          main_prompt: 'Create a word matching exercise including "{word}" meaning "{meaning}" with 2-3 other related words. Return JSON: {json_structure}',
          variables: ['word', 'meaning', 'json_structure'],
          expected_output_format: {
            pairs: [
              { word: 'string', meaning: 'string' }
            ],
            instruction: 'string'
          },
          fallback_template: {
            pairs: [
              { word: '{word}', meaning: '{meaning}' },
              { word: 'other word 1', meaning: 'nghĩa khác 1' },
              { word: 'other word 2', meaning: 'nghĩa khác 2' }
            ],
            instruction: 'Ghép từ tiếng Anh với nghĩa tiếng Việt'
          }
        },
        generation_rules: {
          max_attempts: 3,
          validation_rules: ['check_json_format'],
          difficulty_adaptation: false,
          content_filters: ['family_friendly']
        },
        skill_focus: ['vocabulary'],
        estimated_time: 60,
        requires_audio: false,
        difficulty_levels: ['beginner', 'intermediate']
      },
      {
        exercise_type: 'sentence_building',
        type_display_name: 'Sắp xếp câu',
        description: 'Sắp xếp các từ để tạo thành câu đúng',
        prompt_template: {
          system_context: 'You are creating sentence building exercises for Vietnamese English learners.',
          main_prompt: 'Create a sentence building exercise using "{word}" meaning "{meaning}". Provide a correct sentence and shuffle the words. Return JSON: {json_structure}',
          variables: ['word', 'meaning', 'json_structure'],
          expected_output_format: {
            target_sentence: 'string',
            shuffled_words: ['word1', 'word2', 'word3'],
            translation: 'string',
            hint: 'string'
          },
          fallback_template: {
            target_sentence: 'I like {word}.',
            shuffled_words: ['I', 'like', '{word}', '.'],
            translation: 'Tôi thích {meaning}.',
            hint: 'Start with "I"'
          }
        },
        generation_rules: {
          max_attempts: 3,
          validation_rules: ['check_json_format'],
          difficulty_adaptation: true,
          content_filters: ['family_friendly']
        },
        skill_focus: ['grammar', 'vocabulary'],
        estimated_time: 75,
        requires_audio: false,
        difficulty_levels: ['beginner', 'intermediate', 'advanced']
      },
      {
        exercise_type: 'true_false',
        type_display_name: 'Đúng/Sai',
        description: 'Xác định câu nói đúng hay sai',
        prompt_template: {
          system_context: 'You are creating true/false exercises for Vietnamese English learners.',
          main_prompt: 'Create a true/false statement about "{word}" meaning "{meaning}". Return JSON: {json_structure}',
          variables: ['word', 'meaning', 'json_structure'],
          expected_output_format: {
            statement: 'string',
            is_correct: 'boolean',
            explanation: 'string'
          },
          fallback_template: {
            statement: '"{word}" means "{meaning}" in Vietnamese.',
            is_correct: true,
            explanation: 'This is correct. {word} does mean {meaning} in Vietnamese.'
          }
        },
        generation_rules: {
          max_attempts: 3,
          validation_rules: ['check_json_format'],
          difficulty_adaptation: true,
          content_filters: ['family_friendly']
        },
        skill_focus: ['vocabulary'],
        estimated_time: 20,
        requires_audio: false,
        difficulty_levels: ['beginner', 'intermediate']
      },
      {
        exercise_type: 'listen_choose',
        type_display_name: 'Nghe và chọn',
        description: 'Nghe audio và chọn hình ảnh/từ đúng',
        prompt_template: {
          system_context: 'You are creating listen and choose exercises for Vietnamese English learners.',
          main_prompt: 'Create a listen and choose exercise for "{word}" meaning "{meaning}". Return JSON: {json_structure}',
          variables: ['word', 'meaning', 'json_structure'],
          expected_output_format: {
            audio_text: 'string',
            instruction: 'string',
            options: [
              { id: 'string', label: 'string', is_correct: 'boolean' }
            ]
          },
          fallback_template: {
            audio_text: '{word}',
            instruction: 'Listen and choose the correct meaning',
            options: [
              { id: 'opt1', label: '{meaning}', is_correct: true },
              { id: 'opt2', label: 'wrong meaning 1', is_correct: false },
              { id: 'opt3', label: 'wrong meaning 2', is_correct: false }
            ]
          }
        },
        generation_rules: {
          max_attempts: 3,
          validation_rules: ['check_json_format'],
          difficulty_adaptation: true,
          content_filters: ['family_friendly']
        },
        skill_focus: ['listening', 'vocabulary'],
        estimated_time: 40,
        requires_audio: true,
        difficulty_levels: ['beginner', 'intermediate']
      },
      {
        exercise_type: 'speak_repeat',
        type_display_name: 'Nói theo',
        description: 'Nghe và lặp lại phát âm',
        prompt_template: {
          system_context: 'You are creating pronunciation exercises for Vietnamese English learners.',
          main_prompt: 'Create a speak and repeat exercise for "{word}" meaning "{meaning}". Return JSON: {json_structure}',
          variables: ['word', 'meaning', 'json_structure'],
          expected_output_format: {
            text_to_speak: 'string',
            phonetic: 'string',
            instruction: 'string',
            acceptable_variations: ['variation1', 'variation2']
          },
          fallback_template: {
            text_to_speak: '{word}',
            phonetic: 'pronunciation of {word}',
            instruction: 'Listen and repeat the word',
            acceptable_variations: ['{word}']
          }
        },
        generation_rules: {
          max_attempts: 3,
          validation_rules: ['check_json_format'],
          difficulty_adaptation: true,
          content_filters: ['family_friendly']
        },
        skill_focus: ['speaking', 'pronunciation'],
        estimated_time: 30,
        requires_audio: true,
        requires_microphone: true,
        difficulty_levels: ['beginner', 'intermediate', 'advanced']
      }
    ];
    
    const savedTemplates = await ExerciseTemplate.insertMany(exerciseTemplates);
    console.log(`✅ Created ${savedTemplates.length} exercise templates\n`);
    
    // 2. Create Vocabulary (15 common words)
    console.log('2️⃣ Creating Vocabulary...');
    const vocabularyData = [
      {
        word: 'hello',
        meaning: 'xin chào',
        pronunciation: '/həˈloʊ/',
        part_of_speech: 'interjection',
        difficulty: 'beginner',
        theme_categories: ['greetings_intro'],
        tags: ['greeting', 'common', 'daily'],
        frequency_score: 95,
        definitions: [{
          context: 'greeting',
          meaning: 'lời chào hỏi thân thiện',
          example: {
            sentence: 'Hello, how are you?',
            translation: 'Xin chào, bạn khỏe không?'
          }
        }]
      },
      {
        word: 'goodbye',
        meaning: 'tạm biệt',
        pronunciation: '/ɡʊdˈbaɪ/',
        part_of_speech: 'interjection',
        difficulty: 'beginner',
        theme_categories: ['greetings_intro'],
        tags: ['greeting', 'farewell', 'common'],
        frequency_score: 85,
        definitions: [{
          context: 'farewell',
          meaning: 'lời chào tạm biệt',
          example: {
            sentence: 'Goodbye, see you tomorrow!',
            translation: 'Tạm biệt, hẹn gặp lại ngày mai!'
          }
        }]
      },
      {
        word: 'thank you',
        meaning: 'cảm ơn',
        pronunciation: '/θæŋk juː/',
        part_of_speech: 'interjection',
        difficulty: 'beginner',
        theme_categories: ['greetings_intro'],
        tags: ['politeness', 'gratitude', 'common'],
        frequency_score: 90,
        definitions: [{
          context: 'gratitude',
          meaning: 'lời cảm ơn',
          example: {
            sentence: 'Thank you for your help.',
            translation: 'Cảm ơn bạn đã giúp đỡ.'
          }
        }]
      },
      {
        word: 'please',
        meaning: 'xin hãy, làm ơn',
        pronunciation: '/pliːz/',
        part_of_speech: 'adverb',
        difficulty: 'beginner',
        theme_categories: ['greetings_intro'],
        tags: ['politeness', 'request', 'common'],
        frequency_score: 88,
        definitions: [{
          context: 'polite_request',
          meaning: 'từ lịch sự khi yêu cầu',
          example: {
            sentence: 'Please help me.',
            translation: 'Làm ơn giúp tôi.'
          }
        }]
      },
      {
        word: 'sorry',
        meaning: 'xin lỗi',
        pronunciation: '/ˈsɔːri/',
        part_of_speech: 'adjective',
        difficulty: 'beginner',
        theme_categories: ['greetings_intro'],
        tags: ['apology', 'politeness', 'common'],
        frequency_score: 82,
        definitions: [{
          context: 'apology',
          meaning: 'lời xin lỗi',
          example: {
            sentence: 'Sorry, I am late.',
            translation: 'Xin lỗi, tôi đến muộn.'
          }
        }]
      },
      {
        word: 'one',
        meaning: 'một',
        pronunciation: '/wʌn/',
        part_of_speech: 'noun',
        difficulty: 'beginner',
        theme_categories: ['numbers_time'],
        tags: ['number', 'basic', 'counting'],
        frequency_score: 98,
        definitions: [{
          context: 'counting',
          meaning: 'số đếm 1',
          example: {
            sentence: 'I have one apple.',
            translation: 'Tôi có một quả táo.'
          }
        }]
      },
      {
        word: 'two',
        meaning: 'hai',
        pronunciation: '/tuː/',
        part_of_speech: 'noun',
        difficulty: 'beginner',
        theme_categories: ['numbers_time'],
        tags: ['number', 'basic', 'counting'],
        frequency_score: 96,
        definitions: [{
          context: 'counting',
          meaning: 'số đếm 2',
          example: {
            sentence: 'Two people are talking.',
            translation: 'Hai người đang nói chuyện.'
          }
        }]
      },
      {
        word: 'three',
        meaning: 'ba',
        pronunciation: '/θriː/',
        part_of_speech: 'noun',
        difficulty: 'beginner',
        theme_categories: ['numbers_time'],
        tags: ['number', 'basic', 'counting'],
        frequency_score: 94,
        definitions: [{
          context: 'counting',
          meaning: 'số đếm 3',
          example: {
            sentence: 'I work three days a week.',
            translation: 'Tôi làm việc ba ngày một tuần.'
          }
        }]
      },
      {
        word: 'mother',
        meaning: 'mẹ',
        pronunciation: '/ˈmʌðər/',
        part_of_speech: 'noun',
        difficulty: 'beginner',
        theme_categories: ['family_relationships'],
        tags: ['family', 'relationship', 'common'],
        frequency_score: 85,
        definitions: [{
          context: 'family',
          meaning: 'người mẹ',
          example: {
            sentence: 'My mother is very kind.',
            translation: 'Mẹ tôi rất tốt bụng.'
          }
        }]
      },
      {
        word: 'father',
        meaning: 'bố',
        pronunciation: '/ˈfɑːðər/',
        part_of_speech: 'noun',
        difficulty: 'beginner',
        theme_categories: ['family_relationships'],
        tags: ['family', 'relationship', 'common'],
        frequency_score: 83,
        definitions: [{
          context: 'family',
          meaning: 'người bố',
          example: {
            sentence: 'My father works in an office.',
            translation: 'Bố tôi làm việc ở văn phòng.'
          }
        }]
      },
      {
        word: 'yes',
        meaning: 'có, đúng',
        pronunciation: '/jɛs/',
        part_of_speech: 'interjection',
        difficulty: 'beginner',
        theme_categories: ['greetings_intro'],
        tags: ['response', 'agreement', 'basic'],
        frequency_score: 92,
        definitions: [{
          context: 'agreement',
          meaning: 'từ thể hiện sự đồng ý',
          example: {
            sentence: 'Yes, I understand.',
            translation: 'Vâng, tôi hiểu.'
          }
        }]
      },
      {
        word: 'no',
        meaning: 'không',
        pronunciation: '/noʊ/',
        part_of_speech: 'interjection',
        difficulty: 'beginner',
        theme_categories: ['greetings_intro'],
        tags: ['response', 'disagreement', 'basic'],
        frequency_score: 90,
        definitions: [{
          context: 'disagreement',
          meaning: 'từ thể hiện sự không đồng ý',
          example: {
            sentence: 'No, I don\'t like it.',
            translation: 'Không, tôi không thích.'
          }
        }]
      },
      {
        word: 'good',
        meaning: 'tốt',
        pronunciation: '/ɡʊd/',
        part_of_speech: 'adjective',
        difficulty: 'beginner',
        theme_categories: ['emotions_feelings'],
        tags: ['quality', 'positive', 'common'],
        frequency_score: 88,
        definitions: [{
          context: 'quality',
          meaning: 'có chất lượng tốt',
          example: {
            sentence: 'This is a good book.',
            translation: 'Đây là một quyển sách hay.'
          }
        }]
      },
      {
        word: 'bad',
        meaning: 'xấu, tệ',
        pronunciation: '/bæd/',
        part_of_speech: 'adjective',
        difficulty: 'beginner',
        theme_categories: ['emotions_feelings'],
        tags: ['quality', 'negative', 'common'],
        frequency_score: 86,
        definitions: [{
          context: 'quality',
          meaning: 'có chất lượng xấu',
          example: {
            sentence: 'That was a bad movie.',
            translation: 'Đó là một bộ phim tệ.'
          }
        }]
      },
      {
        word: 'water',
        meaning: 'nước',
        pronunciation: '/ˈwɔːtər/',
        part_of_speech: 'noun',
        difficulty: 'beginner',
        theme_categories: ['food_drinks'],
        tags: ['drink', 'basic', 'daily'],
        frequency_score: 89,
        definitions: [{
          context: 'drink',
          meaning: 'chất lỏng trong suốt để uống',
          example: {
            sentence: 'I drink water every day.',
            translation: 'Tôi uống nước mỗi ngày.'
          }
        }]
      }
    ];
    
    const savedVocabulary = await Vocabulary.insertMany(vocabularyData);
    console.log(`✅ Created ${savedVocabulary.length} vocabulary words\n`);
    
    // 3. Create Admin User
    console.log('3️⃣ Creating Admin User...');
    const adminUser = new User({
      username: 'admin12344',
      email: 'admin41234@lingualeap.com',
      password: 'admin123',
      displayName: 'Admin User',
      language_profile: {
        native_language: 'vi',
        target_language: 'en',
        current_level: 'advanced',
        learning_goals: ['daily_communication'],
        preferred_skills: ['vocabulary', 'grammar']
      }
    });
    await adminUser.save();
    console.log('✅ Admin user created\n');
    
    // 4. Create Sample Course
    console.log('4️⃣ Creating Sample Course...');
    const course = new Course({
      title: 'Bắt đầu với tiếng Anh',
      description: 'Khóa học cơ bản dành cho người mới bắt đầu học tiếng Anh. Tập trung vào từ vựng và giao tiếp hàng ngày.',
      category: 'basic_communication',
      skill_focus: ['vocabulary', 'grammar', 'listening'],
      thumbnail: '/images/course-basic.jpg',
      color: '#4A90E2',
      estimated_duration: 25,
      total_units: 0,
      prerequisites: [],
      challenge_test: {
        total_questions: 25,
        pass_percentage: 80,
        must_correct_questions: [1, 5, 10, 15, 20],
        time_limit: 30
      },
      is_premium: false,
      is_published: true,
      sort_order: 1,
      created_by: adminUser._id
    });
    await course.save();
    console.log('✅ Course created:', course.title);
    
    // 5. Create Sample Units
    console.log('\n5️⃣ Creating Sample Units...');
    const units = [
      {
        title: 'Chào hỏi & Giới thiệu',
        description: 'Học cách chào hỏi và giới thiệu bản thân trong các tình huống khác nhau',
        course_id: course._id,
        theme: 'greetings_intro',
        icon: 'wave',
        color: '#FF6B6B',
        estimated_duration: 120,
        prerequisites: {
          previous_unit_id: null,
          minimum_score: 0,
          required_hearts: 0
        },
        challenge_test: {
          total_questions: 15,
          pass_percentage: 80,
          must_correct_questions: [2, 7, 12],
          time_limit: 20
        },
        is_premium: false,
        is_published: true,
        sort_order: 1
      },
      {
        title: 'Số đếm & Thời gian',
        description: 'Học các số đếm cơ bản và cách nói về thời gian',
        course_id: course._id,
        theme: 'numbers_time',
        icon: 'clock',
        color: '#4ECDC4',
        estimated_duration: 100,
        prerequisites: {
          previous_unit_id: null,
          minimum_score: 80,
          required_hearts: 3
        },
        challenge_test: {
          total_questions: 12,
          pass_percentage: 80,
          must_correct_questions: [3, 8],
          time_limit: 15
        },
        is_premium: false,
        is_published: true,
        sort_order: 2
      },
      {
        title: 'Gia đình & Các mối quan hệ',
        description: 'Học từ vựng về gia đình và cách nói về các mối quan hệ',
        course_id: course._id,
        theme: 'family_relationships',
        icon: 'family',
        color: '#45B7D1',
        estimated_duration: 110,
        prerequisites: {
          previous_unit_id: null,
          minimum_score: 75,
          required_hearts: 5
        },
        challenge_test: {
          total_questions: 18,
          pass_percentage: 80,
          must_correct_questions: [4, 9, 14],
          time_limit: 25
        },
        is_premium: true,
        is_published: true,
        sort_order: 3
      }
    ];
    
    const savedUnits = [];
    for (let i = 0; i < units.length; i++) {
      if (i > 0) {
        units[i].prerequisites.previous_unit_id = savedUnits[i-1]._id;
      }
      const unit = new Unit(units[i]);
      await unit.save();
      savedUnits.push(unit);
      console.log(`✅ Unit ${i+1} created:`, unit.title);
    }
    
    // Update course total_units
    course.total_units = savedUnits.length;
    await course.save();
    
    // 6. Create Sample Lessons
    console.log('\n6️⃣ Creating Sample Lessons...');
    
    // Get vocabulary references
    const vocabMap = {};
    savedVocabulary.forEach(vocab => {
      vocabMap[vocab.word] = vocab;
    });
    
    const lessons = [
      // Unit 1: Greetings - Lesson 1
      {
        title: 'Basic Greetings',
        description: 'Học cách chào hỏi cơ bản: Hello, Goodbye',
        course_id: course._id,
        unit_id: savedUnits[0]._id,
        lesson_type: 'vocabulary',
        objective: 'Học cách chào hỏi và tạm biệt một cách lịch sự',
        vocabulary_pool: [
          {
            vocabulary_id: vocabMap['hello']._id,
            context_in_lesson: 'basic greeting',
            is_main_focus: true,
            introduction_order: 1,
            difficulty_weight: 2
          },
          {
            vocabulary_id: vocabMap['goodbye']._id,
            context_in_lesson: 'farewell greeting',
            is_main_focus: true,
            introduction_order: 2,
            difficulty_weight: 2
          }
        ],
        lesson_context: {
          situation: 'meeting new people',
          cultural_context: 'Vietnamese social customs',
          use_cases: ['formal greeting', 'casual greeting', 'farewell'],
          avoid_topics: ['romantic', 'political', 'religious']
        },
        grammar_point: {
          title: 'Simple Greetings',
          explanation: 'Cách sử dụng Hello và Goodbye trong giao tiếp hàng ngày',
          pattern: 'Hello/Goodbye + [name/title]',
          examples: ['Hello John', 'Goodbye teacher', 'Hello everyone']
        },
        exercise_generation: {
          total_exercises: 6,
          exercise_distribution: {
            multiple_choice: 2,
            fill_blank: 2,
            listening: 1,
            translation: 1,
            word_matching: 0
          },
          difficulty_progression: true,
          vocabulary_coverage: 'all'
        },
        estimated_duration: 15,
        xp_reward: 15,
        is_premium: false,
        is_published: true,
        sort_order: 1
      },
      // Unit 1: Greetings - Lesson 2
      {
        title: 'Polite Expressions',
        description: 'Học cách nói cảm ơn, xin lỗi và làm ơn',
        course_id: course._id,
        unit_id: savedUnits[0]._id,
        lesson_type: 'vocabulary',
        objective: 'Học các cách diễn đạt lịch sự trong giao tiếp',
        vocabulary_pool: [
          {
            vocabulary_id: vocabMap['thank you']._id,
            context_in_lesson: 'expressing gratitude',
            is_main_focus: true,
            introduction_order: 1,
            difficulty_weight: 3
          },
          {
            vocabulary_id: vocabMap['please']._id,
            context_in_lesson: 'polite request',
            is_main_focus: true,
            introduction_order: 2,
            difficulty_weight: 3
          },
          {
            vocabulary_id: vocabMap['sorry']._id,
            context_in_lesson: 'apology',
            is_main_focus: true,
            introduction_order: 3,
            difficulty_weight: 3
          }
        ],
        lesson_context: {
          situation: 'daily interactions',
          cultural_context: 'Politeness in Vietnamese and English cultures',
          use_cases: ['requesting help', 'expressing gratitude', 'apologizing'],
          avoid_topics: ['personal conflicts', 'serious mistakes']
        },
        grammar_point: {
          title: 'Polite Language',
          explanation: 'Cách sử dụng từ ngữ lịch sự trong các tình huống khác nhau',
          pattern: 'Please + [request], Thank you + [for what], Sorry + [for what]',
          examples: ['Please help me', 'Thank you for coming', 'Sorry for being late']
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
        estimated_duration: 18,
        xp_reward: 18,
        is_premium: false,
        is_published: true,
        sort_order: 2
      },
      // Unit 1: Greetings - Lesson 3
      {
        title: 'Yes and No',
        description: 'Học cách nói có và không',
        course_id: course._id,
        unit_id: savedUnits[0]._id,
        lesson_type: 'vocabulary',
        objective: 'Học cách trả lời có hoặc không trong các tình huống',
        vocabulary_pool: [
          {
            vocabulary_id: vocabMap['yes']._id,
            context_in_lesson: 'agreement response',
            is_main_focus: true,
            introduction_order: 1,
            difficulty_weight: 2
          },
          {
            vocabulary_id: vocabMap['no']._id,
            context_in_lesson: 'disagreement response',
            is_main_focus: true,
            introduction_order: 2,
            difficulty_weight: 2
          }
        ],
        lesson_context: {
          situation: 'responding to questions',
          cultural_context: 'Direct vs indirect responses in different cultures',
          use_cases: ['answering questions', 'expressing agreement', 'polite disagreement'],
          avoid_topics: ['controversial topics', 'personal sensitive matters']
        },
        grammar_point: {
          title: 'Simple Responses',
          explanation: 'Cách sử dụng Yes và No để trả lời câu hỏi',
          pattern: 'Yes/No + [additional information]',
          examples: ['Yes, I do', 'No, thank you', 'Yes, please']
        },
        exercise_generation: {
          total_exercises: 5,
          exercise_distribution: {
            multiple_choice: 2,
            fill_blank: 1,
            listening: 1,
            true_false: 1,
            word_matching: 0
          },
          difficulty_progression: true,
          vocabulary_coverage: 'all'
        },
        estimated_duration: 12,
        xp_reward: 12,
        is_premium: false,
        is_published: true,
        sort_order: 3
      },
      // Unit 2: Numbers - Lesson 1
      {
        title: 'Numbers 1-3',
        description: 'Học đếm từ 1 đến 3 bằng tiếng Anh',
        course_id: course._id,
        unit_id: savedUnits[1]._id,
        lesson_type: 'vocabulary',
        objective: 'Học cách đếm và sử dụng số từ 1 đến 3',
        vocabulary_pool: [
          {
            vocabulary_id: vocabMap['one']._id,
            context_in_lesson: 'counting numbers',
            is_main_focus: true,
            introduction_order: 1,
            difficulty_weight: 2
          },
          {
            vocabulary_id: vocabMap['two']._id,
            context_in_lesson: 'counting numbers',
            is_main_focus: true,
            introduction_order: 2,
            difficulty_weight: 2
          },
          {
            vocabulary_id: vocabMap['three']._id,
            context_in_lesson: 'counting numbers',
            is_main_focus: true,
            introduction_order: 3,
            difficulty_weight: 2
          }
        ],
        lesson_context: {
          situation: 'counting objects and quantities',
          cultural_context: 'Numbers in daily life',
          use_cases: ['counting items', 'talking about quantity', 'basic math'],
          avoid_topics: ['complex calculations', 'financial numbers']
        },
        grammar_point: {
          title: 'Numbers with Nouns',
          explanation: 'Cách sử dụng số với danh từ',
          pattern: 'Number + noun(s)',
          examples: ['one apple', 'two books', 'three people']
        },
        exercise_generation: {
          total_exercises: 6,
          exercise_distribution: {
            multiple_choice: 2,
            fill_blank: 2,
            listening: 1,
            word_matching: 1,
            translation: 0
          },
          difficulty_progression: true,
          vocabulary_coverage: 'all'
        },
        estimated_duration: 12,
        xp_reward: 12,
        is_premium: false,
        is_published: true,
        sort_order: 1
      },
      // Unit 3: Family - Lesson 1 (Premium)
      {
        title: 'Parents',
        description: 'Học từ vựng về bố mẹ',
        course_id: course._id,
        unit_id: savedUnits[2]._id,
        lesson_type: 'vocabulary',
        objective: 'Học cách nói về bố mẹ và gia đình',
        vocabulary_pool: [
          {
            vocabulary_id: vocabMap['mother']._id,
            context_in_lesson: 'family members',
            is_main_focus: true,
            introduction_order: 1,
            difficulty_weight: 3
          },
          {
            vocabulary_id: vocabMap['father']._id,
            context_in_lesson: 'family members',
            is_main_focus: true,
            introduction_order: 2,
            difficulty_weight: 3
          }
        ],
        lesson_context: {
          situation: 'talking about family',
          cultural_context: 'Family relationships in Vietnamese and Western cultures',
          use_cases: ['introducing family members', 'talking about parents', 'family photos'],
          avoid_topics: ['family problems', 'divorce', 'conflicts']
        },
        grammar_point: {
          title: 'Possessive Pronouns',
          explanation: 'Cách sử dụng my, your để nói về gia đình',
          pattern: 'My/Your + family member',
          examples: ['My mother', 'Your father', 'My family']
        },
        exercise_generation: {
          total_exercises: 8,
          exercise_distribution: {
            multiple_choice: 2,
            fill_blank: 2,
            listening: 2,
            translation: 1,
            word_matching: 1
          },
          difficulty_progression: true,
          vocabulary_coverage: 'all'
        },
        estimated_duration: 20,
        xp_reward: 25,
        is_premium: true,
        is_published: true,
        sort_order: 1
      },
      // Additional lesson with more vocabulary
      {
        title: 'Good and Bad',
        description: 'Học cách miêu tả tốt và xấu',
        course_id: course._id,
        unit_id: savedUnits[0]._id,
        lesson_type: 'vocabulary',
        objective: 'Học cách miêu tả chất lượng cơ bản',
        vocabulary_pool: [
          {
            vocabulary_id: vocabMap['good']._id,
            context_in_lesson: 'positive description',
            is_main_focus: true,
            introduction_order: 1,
            difficulty_weight: 3
          },
          {
            vocabulary_id: vocabMap['bad']._id,
            context_in_lesson: 'negative description',
            is_main_focus: true,
            introduction_order: 2,
            difficulty_weight: 3
          },
          {
            vocabulary_id: vocabMap['water']._id,
            context_in_lesson: 'basic necessity',
            is_main_focus: false,
            introduction_order: 3,
            difficulty_weight: 2
          }
        ],
        lesson_context: {
          situation: 'describing things and experiences',
          cultural_context: 'Expressing opinions politely',
          use_cases: ['giving opinions', 'describing quality', 'making judgments'],
          avoid_topics: ['harsh criticism', 'personal attacks']
        },
        grammar_point: {
          title: 'Adjectives',
          explanation: 'Cách sử dụng tính từ để miêu tả',
          pattern: 'This is + adjective',
          examples: ['This is good', 'That is bad', 'It is very good']
        },
        exercise_generation: {
          total_exercises: 7,
          exercise_distribution: {
            multiple_choice: 2,
            fill_blank: 2,
            listening: 1,
            translation: 1,
            true_false: 1
          },
          difficulty_progression: true,
          vocabulary_coverage: 'main_focus_only'
        },
        estimated_duration: 16,
        xp_reward: 16,
        is_premium: false,
        is_published: true,
        sort_order: 4
      }
    ];
    
    const savedLessons = [];
    for (const lessonData of lessons) {
      const lesson = new Lesson(lessonData);
      await lesson.save();
      savedLessons.push(lesson);
      console.log(`✅ Lesson created:`, lesson.title);
    }
    
    // Update units with total_lessons
    for (let i = 0; i < savedUnits.length; i++) {
      const lessonCount = savedLessons.filter(l => l.unit_id.toString() === savedUnits[i]._id.toString()).length;
      savedUnits[i].total_lessons = lessonCount;
      await savedUnits[i].save();
    }
    
    // 7. Create Sample Test User with Progress
    console.log('\n7️⃣ Creating Test User with Progress...');
    const testUser = new User({
      username: 'testuser1234',
      email: 'tes1234t@lingualeap.com',
      password: 'test123',
      displayName: 'Test User',
      language_profile: {
        native_language: 'vi',
        target_language: 'en',
        current_level: 'beginner',
        learning_goals: ['daily_communication', 'travel_english'],
        preferred_skills: ['vocabulary', 'listening', 'speaking']
      },
      gamification: {
        total_xp: 85,
        current_level: 1,
        hearts: {
          current: 4,
          last_refill: new Date()
        },
        streak: {
          current: 2,
          longest: 5,
          last_activity: new Date()
        }
      },
      learning_progress: {
        courses: [{
          course_id: course._id,
          status: 'in_progress',
          progress_percentage: 30,
          started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          current_unit_id: savedUnits[0]._id,
          current_lesson_id: savedLessons[1]._id
        }],
        vocabulary_stats: {
          total_words_learned: 8,
          words_by_mastery: {
            new: 5,
            learning: 2,
            learned: 1,
            mastered: 0
          },
          words_due_for_review: 3
        },
        exercise_stats: {
          total_exercises_completed: 18,
          overall_success_rate: 78,
          by_exercise_type: {
            multiple_choice: {
              completed: 8,
              success_rate: 85
            },
            fill_blank: {
              completed: 6,
              success_rate: 75
            },
            listening: {
              completed: 4,
              success_rate: 65
            }
          }
        }
      }
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser.username);
    
    // 8. Create User Vocabulary Progress
    console.log('\n8️⃣ Creating User Vocabulary Progress...');
    const progressData = [
      {
        user_id: testUser._id,
        vocabulary_id: vocabMap['hello']._id,
        mastery_level: 'learned',
        correct_answers: 8,
        total_attempts: 10,
        first_learned_lesson: savedLessons[0]._id,
        spaced_repetition: {
          interval: 3,
          ease_factor: 2.6,
          repetitions: 2,
          last_reviewed: new Date(Date.now() - 24 * 60 * 60 * 1000),
          next_review_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        exercise_performance: {
          multiple_choice: { correct: 3, total: 4 },
          fill_blank: { correct: 2, total: 3 },
          listening: { correct: 3, total: 3 }
        }
      },
      {
        user_id: testUser._id,
        vocabulary_id: vocabMap['goodbye']._id,
        mastery_level: 'learning',
        correct_answers: 5,
        total_attempts: 8,
        first_learned_lesson: savedLessons[0]._id,
        spaced_repetition: {
          interval: 1,
          ease_factor: 2.3,
          repetitions: 1,
          last_reviewed: new Date(),
          next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        exercise_performance: {
          multiple_choice: { correct: 2, total: 3 },
          fill_blank: { correct: 2, total: 3 },
          translation: { correct: 1, total: 2 }
        }
      },
      {
        user_id: testUser._id,
        vocabulary_id: vocabMap['thank you']._id,
        mastery_level: 'learning',
        correct_answers: 4,
        total_attempts: 6,
        first_learned_lesson: savedLessons[1]._id,
        spaced_repetition: {
          interval: 2,
          ease_factor: 2.4,
          repetitions: 1,
          last_reviewed: new Date(Date.now() - 12 * 60 * 60 * 1000),
          next_review_date: new Date(Date.now() + 36 * 60 * 60 * 1000)
        },
        exercise_performance: {
          multiple_choice: { correct: 2, total: 2 },
          listening: { correct: 1, total: 2 },
          translation: { correct: 1, total: 2 }
        }
      },
      {
        user_id: testUser._id,
        vocabulary_id: vocabMap['please']._id,
        mastery_level: 'new',
        correct_answers: 2,
        total_attempts: 4,
        first_learned_lesson: savedLessons[1]._id,
        spaced_repetition: {
          interval: 1,
          ease_factor: 2.5,
          repetitions: 0,
          last_reviewed: new Date(),
          next_review_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        exercise_performance: {
          multiple_choice: { correct: 1, total: 2 },
          fill_blank: { correct: 1, total: 2 }
        }
      },
      {
        user_id: testUser._id,
        vocabulary_id: vocabMap['yes']._id,
        mastery_level: 'learning',
        correct_answers: 6,
        total_attempts: 7,
        first_learned_lesson: savedLessons[2]._id,
        spaced_repetition: {
          interval: 2,
          ease_factor: 2.7,
          repetitions: 2,
          last_reviewed: new Date(Date.now() - 6 * 60 * 60 * 1000),
          next_review_date: new Date(Date.now() + 42 * 60 * 60 * 1000)
        },
        exercise_performance: {
          multiple_choice: { correct: 3, total: 3 },
          true_false: { correct: 2, total: 2 },
          listening: { correct: 1, total: 2 }
        }
      }
    ];
    
    const savedProgress = await UserVocabularyProgress.insertMany(progressData);
    console.log(`✅ Created ${savedProgress.length} vocabulary progress records`);
    
    // 9. Create Sample Personal Exercise Bank
    console.log('\n9️⃣ Creating Personal Exercise Bank...');
    const exerciseBankData = [
      {
        user_id: testUser._id,
        exercise_content: {
          question: 'What does "hello" mean in Vietnamese?',
          options: ['xin chào', 'tạm biệt', 'cảm ơn', 'xin lỗi'],
          correct_index: 0,
          explanation: 'Hello means "xin chào" in Vietnamese, used as a friendly greeting.'
        },
        exercise_type: 'multiple_choice',
        source_lesson_id: savedLessons[0]._id,
        vocabulary_focus: [vocabMap['hello']._id],
        lesson_context: {
          situation: 'meeting new people',
          theme: 'greetings_intro',
          difficulty: 'beginner'
        },
        performance: 'correct',
        time_taken: 28,
        user_response: {
          selected_index: 0
        },
        ai_generation_info: {
          model_used: 'claude-3-5-sonnet-20241022',
          generation_time: 1.8,
          fallback_used: false
        },
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user_id: testUser._id,
        exercise_content: {
          sentence: 'I say _____ when I meet my friends.',
          correct_word: 'hello',
          translation: 'Tôi nói _____ khi gặp bạn bè.',
          alternatives: ['hi', 'hey']
        },
        exercise_type: 'fill_blank',
        source_lesson_id: savedLessons[0]._id,
        vocabulary_focus: [vocabMap['hello']._id],
        lesson_context: {
          situation: 'meeting new people',
          theme: 'greetings_intro',
          difficulty: 'beginner'
        },
        performance: 'correct',
        time_taken: 45,
        user_response: {
          user_input: 'hello'
        },
        ai_generation_info: {
          model_used: 'claude-3-5-sonnet-20241022',
          generation_time: 2.1,
          fallback_used: false
        },
        completed_at: new Date(Date.now() - 30 * 60 * 60 * 1000)
      },
      {
        user_id: testUser._id,
        exercise_content: {
          audio_text: 'Thank you for helping me with my homework.',
          question: 'What is the person expressing?',
          options: ['gratitude', 'apology', 'request'],
          correct_index: 0
        },
        exercise_type: 'listening',
        source_lesson_id: savedLessons[1]._id,
        vocabulary_focus: [vocabMap['thank you']._id],
        lesson_context: {
          situation: 'daily interactions',
          theme: 'greetings_intro',
          difficulty: 'beginner'
        },
        performance: 'correct',
        time_taken: 62,
        user_response: {
          selected_index: 0
        },
        ai_generation_info: {
          model_used: 'claude-3-5-sonnet-20241022',
          generation_time: 2.5,
          fallback_used: false
        },
        completed_at: new Date(Date.now() - 18 * 60 * 60 * 1000)
      },
      {
        user_id: testUser._id,
        exercise_content: {
          vn_to_en: {
            vietnamese: 'Xin lỗi, tôi đến muộn.',
            english: 'Sorry, I am late.'
          },
          en_to_vn: {
            english: 'Sorry for the inconvenience.',
            vietnamese: 'Xin lỗi vì sự bất tiện.'
          }
        },
        exercise_type: 'translation',
        source_lesson_id: savedLessons[1]._id,
        vocabulary_focus: [vocabMap['sorry']._id],
        lesson_context: {
          situation: 'daily interactions',
          theme: 'greetings_intro',
          difficulty: 'beginner'
        },
        performance: 'partially_correct',
        time_taken: 95,
        user_response: {
          vn_to_en_answer: 'Sorry, I come late',
          en_to_vn_answer: 'Xin lỗi vì sự bất tiện.'
        },
        review_priority: 'medium',
        ai_generation_info: {
          model_used: 'claude-3-5-sonnet-20241022',
          generation_time: 2.8,
          fallback_used: false
        },
        completed_at: new Date(Date.now() - 8 * 60 * 60 * 1000)
      },
      {
        user_id: testUser._id,
        exercise_content: {
          statement: '"Yes" is used to show agreement in English.',
          is_correct: true,
          explanation: 'Correct! "Yes" is indeed used to express agreement or affirmation.'
        },
        exercise_type: 'true_false',
        source_lesson_id: savedLessons[2]._id,
        vocabulary_focus: [vocabMap['yes']._id],
        lesson_context: {
          situation: 'responding to questions',
          theme: 'greetings_intro',
          difficulty: 'beginner'
        },
        performance: 'correct',
        time_taken: 18,
        user_response: {
          selected_answer: true
        },
        ai_generation_info: {
          model_used: 'claude-3-5-sonnet-20241022',
          generation_time: 1.5,
          fallback_used: false
        },
        completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];
    
    const savedExerciseBank = await PersonalExerciseBank.insertMany(exerciseBankData);
    console.log(`✅ Created ${savedExerciseBank.length} personal exercise records`);
    
    console.log('\n🎉 SAMPLE DATA CREATION COMPLETED!');
    console.log('\n📊 Summary:');
    console.log(`   ✅ ${savedTemplates.length} Exercise Templates (9 types)`);
    console.log(`   ✅ ${savedVocabulary.length} Vocabulary Words`);
    console.log(`   ✅ 1 Admin User + 1 Test User`);
    console.log(`   ✅ 1 Course (${course.title})`);
    console.log(`   ✅ ${savedUnits.length} Units`);
    console.log(`   ✅ ${savedLessons.length} Lessons`);
    console.log(`   ✅ ${savedProgress.length} User Progress Records`);
    console.log(`   ✅ ${savedExerciseBank.length} Personal Exercise Bank Records`);
    
    console.log('\n🚀 Ready for GraphQL API development!');
    
    // Display some useful info
    console.log('\n📝 Useful Information:');
    console.log(`   👤 Admin: admin@lingualeap.com / admin123`);
    console.log(`   👤 Test User: test@lingualeap.com / test123`);
    console.log(`   📚 Course ID: ${course._id}`);
    console.log(`   🎯 Unit 1 ID: ${savedUnits[0]._id} (${savedUnits[0].title})`);
    console.log(`   🎯 Unit 2 ID: ${savedUnits[1]._id} (${savedUnits[1].title})`);
    console.log(`   🎯 Unit 3 ID: ${savedUnits[2]._id} (${savedUnits[2].title})`);
    console.log(`   📖 Lesson 1 ID: ${savedLessons[0]._id} (${savedLessons[0].title})`);
    console.log(`   📖 Lesson 2 ID: ${savedLessons[1]._id} (${savedLessons[1].title})`);
    
    console.log('\n🔤 Sample Vocabulary Created:');
    console.log('   Greetings: hello, goodbye, thank you, please, sorry, yes, no');
    console.log('   Numbers: one, two, three');
    console.log('   Family: mother, father');
    console.log('   Descriptive: good, bad');
    console.log('   Basic: water');
    
    console.log('\n🎮 Exercise Types Available:');
    console.log('   ✅ multiple_choice, fill_blank, listening, translation');
    console.log('   ✅ word_matching, sentence_building, true_false');
    console.log('   ✅ listen_choose, speak_repeat');
    
  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run sample data creation
createSampleData();