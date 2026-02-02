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

    await User.deleteMany({});
    await Subject.deleteMany({});
    await Topic.deleteMany({});
    await Question.deleteMany({});
    console.log('Cleared existing data');
    
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@prepmetrics.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin'
    });

    const subjects = await Subject.insertMany([
      { name: 'Data Structures & Algorithms', slug: 'data-structures-algorithms', description: 'Master fundamental DSA concepts', category: 'Data Structures & Algorithms', icon: '🌳' },
      { name: 'Database Management Systems', slug: 'dbms', description: 'Learn DBMS fundamentals and SQL', category: 'Computer Science Fundamentals', icon: '🗄️' },
      { name: 'Object-Oriented Programming', slug: 'oop', description: 'Master OOP principles', category: 'Computer Science Fundamentals', icon: '🎯' },
      { name: 'Python Programming', slug: 'python', description: 'Python for interviews', category: 'Programming Languages', icon: '🐍' }
    ]);

    const allTopics = await Topic.insertMany([
      { name: 'Arrays', subject: subjects[0]._id, difficulty: 'easy' },
      { name: 'Stacks', subject: subjects[0]._id, difficulty: 'easy' },
      { name: 'SQL Basics', subject: subjects[1]._id, difficulty: 'easy' },
      { name: 'Normalization', subject: subjects[1]._id, difficulty: 'medium' },
      { name: 'Classes & Objects', subject: subjects[2]._id, difficulty: 'easy' },
      { name: 'Inheritance', subject: subjects[2]._id, difficulty: 'medium' },
      { name: 'Python Basics', subject: subjects[3]._id, difficulty: 'easy' },
      { name: 'Data Types', subject: subjects[3]._id, difficulty: 'easy' }
    ]);

    const questionsData = [];

    // --- 10 DSA QUESTIONS ---
    for(let i=1; i<=10; i++) {
      questionsData.push({
        subject: subjects[0]._id, topic: allTopics[0]._id,
        questionText: `DSA Question ${i}: What is the time complexity of operation ${i}?`,
        options: [{ text: 'O(1)', isCorrect: i%2===0 }, { text: 'O(n)', isCorrect: i%2!==0 }, { text: 'O(log n)', isCorrect: false }, { text: 'O(n²)', isCorrect: false }],
        correctAnswer: i%2===0 ? 'O(1)' : 'O(n)', difficulty: i > 5 ? 'medium' : 'easy', createdBy: admin._id
      });
    }

    // --- 10 DBMS QUESTIONS ---
    for(let i=1; i<=10; i++) {
      questionsData.push({
        subject: subjects[1]._id, topic: allTopics[2]._id,
        questionText: `DBMS Question ${i}: Select the correct SQL command for task ${i}.`,
        options: [{ text: 'SELECT', isCorrect: true }, { text: 'UPDATE', isCorrect: false }, { text: 'DROP', isCorrect: false }, { text: 'ALTER', isCorrect: false }],
        correctAnswer: 'SELECT', difficulty: i > 5 ? 'medium' : 'easy', createdBy: admin._id
      });
    }

    // --- 10 OOP QUESTIONS ---
    for(let i=1; i<=10; i++) {
      questionsData.push({
        subject: subjects[2]._id, topic: allTopics[4]._id,
        questionText: `OOP Question ${i}: Which principle is demonstrated in example ${i}?`,
        options: [{ text: 'Encapsulation', isCorrect: i%2===0 }, { text: 'Inheritance', isCorrect: i%2!==0 }, { text: 'Polymorphism', isCorrect: false }, { text: 'Abstraction', isCorrect: false }],
        correctAnswer: i%2===0 ? 'Encapsulation' : 'Inheritance', difficulty: i > 5 ? 'medium' : 'easy', createdBy: admin._id
      });
    }

    // --- 10 PYTHON QUESTIONS ---
    for(let i=1; i<=10; i++) {
      questionsData.push({
        subject: subjects[3]._id, topic: allTopics[6]._id,
        questionText: `Python Question ${i}: What is the output of script ${i}?`,
        options: [{ text: 'Error', isCorrect: false }, { text: 'None', isCorrect: false }, { text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }],
        correctAnswer: 'True', difficulty: i > 5 ? 'medium' : 'easy', createdBy: admin._id
      });
    }

    await Question.insertMany(questionsData);
    console.log('40 Questions (10 per subject) created successfully');

    for (const sId of subjects.map(s => s._id)) {
      const count = await Question.countDocuments({ subject: sId });
      await Subject.findByIdAndUpdate(sId, { totalQuestions: count });
    }
    
    for (const tId of allTopics.map(t => t._id)) {
      const count = await Question.countDocuments({ topic: tId });
      await Topic.findByIdAndUpdate(tId, { questionCount: count });
    }

    console.log('\n✅ Database Seeded! All subjects have 10 questions.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedDatabase();