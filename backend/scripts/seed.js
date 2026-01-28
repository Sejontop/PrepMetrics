const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Question = require('../models/Question');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Topic.deleteMany({});
    await Question.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@prepmetrics.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create sample subjects
    const subjects = await Subject.insertMany([
      {
        name: 'Data Structures & Algorithms',
        slug: 'data-structures-algorithms',
        description: 'Master fundamental DSA concepts',
        category: 'Data Structures & Algorithms',
        icon: '🌳',
        certificateCriteria: {
          minimumQuizzes: 5,
          minimumAccuracy: 70,
          requiredTopicsCovered: 3
        }
      },
      {
        name: 'Database Management Systems',
        slug: 'dbms',
        description: 'Learn DBMS fundamentals and SQL',
        category: 'Computer Science Fundamentals',
        icon: '🗄️'
      },
      {
        name: 'Object-Oriented Programming',
        slug: 'oop',
        description: 'Master OOP principles',
        category: 'Computer Science Fundamentals',
        icon: '🎯'
      },
      {
        name: 'Python Programming',
        slug: 'python',
        description: 'Python for interviews',
        category: 'Programming Languages',
        icon: '🐍'
      }
    ]);
    console.log('Subjects created');

    // Create topics for DSA
    const dsaTopics = await Topic.insertMany([
      { name: 'Arrays', subject: subjects[0]._id, difficulty: 'easy' },
      { name: 'Linked Lists', subject: subjects[0]._id, difficulty: 'medium' },
      { name: 'Trees', subject: subjects[0]._id, difficulty: 'medium' },
      { name: 'Graphs', subject: subjects[0]._id, difficulty: 'hard' },
      { name: 'Dynamic Programming', subject: subjects[0]._id, difficulty: 'hard' }
    ]);
    console.log('Topics created');

    // Create sample questions
    const questions = await Question.insertMany([
      {
        subject: subjects[0]._id,
        topic: dsaTopics[0]._id,
        questionText: 'What is the time complexity of accessing an element in an array by index?',
        questionType: 'mcq',
        options: [
          { text: 'O(1)', isCorrect: true },
          { text: 'O(n)', isCorrect: false },
          { text: 'O(log n)', isCorrect: false },
          { text: 'O(n²)', isCorrect: false }
        ],
        correctAnswer: 'O(1)',
        explanation: 'Array access by index is a constant time operation O(1) because elements are stored contiguously in memory.',
        difficulty: 'easy',
        marks: 1,
        timeLimit: 30,
        createdBy: admin._id
      },
      {
        subject: subjects[0]._id,
        topic: dsaTopics[1]._id,
        questionText: 'Which data structure uses LIFO (Last In First Out) principle?',
        questionType: 'mcq',
        options: [
          { text: 'Queue', isCorrect: false },
          { text: 'Stack', isCorrect: true },
          { text: 'Array', isCorrect: false },
          { text: 'Tree', isCorrect: false }
        ],
        correctAnswer: 'Stack',
        explanation: 'Stack follows LIFO principle where the last element added is the first one to be removed.',
        difficulty: 'easy',
        marks: 1,
        timeLimit: 30,
        createdBy: admin._id
      }
    ]);
    console.log('Sample questions created');

    // Update question counts
    for (const topic of dsaTopics) {
      const count = await Question.countDocuments({ topic: topic._id });
      await Topic.findByIdAndUpdate(topic._id, { questionCount: count });
    }

    for (const subject of subjects) {
      const count = await Question.countDocuments({ subject: subject._id });
      await Subject.findByIdAndUpdate(subject._id, { totalQuestions: count });
    }
    console.log('Updated question counts');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nAdmin Credentials:');
    console.log('Email:', process.env.ADMIN_EMAIL || 'admin@prepmetrics.com');
    console.log('Password:', process.env.ADMIN_PASSWORD || 'Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();