/**
 * PrepMetrics Database Seeder
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

const SUBJECTS = [
  { name: 'Aptitude & Reasoning',     slug: 'aptitude',    icon: '🧮', color: '#6366f1', order: 1 },
  { name: 'DBMS',                     slug: 'dbms',        icon: '🗄️', color: '#0ea5e9', order: 2 },
  { name: 'OOP Concepts',             slug: 'oops',        icon: '🔷', color: '#14b8a6', order: 3 },
  { name: 'Data Structures & Algo',   slug: 'dsa',         icon: '🌳', color: '#f59e0b', order: 4 },
  { name: 'Computer Networks',        slug: 'cn',          icon: '🌐', color: '#8b5cf6', order: 5 },
  { name: 'SQL',                      slug: 'sql',         icon: '📊', color: '#ec4899', order: 6 },
  { name: 'Python',                   slug: 'python',      icon: '🐍', color: '#22c55e', order: 7 },
  { name: 'Java',                     slug: 'java',        icon: '☕', color: '#ef4444', order: 8 },
  { name: 'C & C++',                  slug: 'c-cpp',       icon: '⚙️', color: '#78716c', order: 9 },
  { name: 'Cyber Security',           slug: 'cybersec',    icon: '🔒', color: '#f97316', order: 10 },
  { name: 'Software Engineering',     slug: 'se',          icon: '🛠️', color: '#64748b', order: 11 },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Clear
  await Promise.all([User, Subject, Topic, Question, Quiz].map(M => M.deleteMany({})));
  console.log('Cleared existing data');

  // Admin + demo user
  const admin = await User.create({ name: 'Admin', email: 'admin@prepmetrics.io', password: 'admin123', role: 'admin' });
  const user  = await User.create({ name: 'Demo User', email: 'demo@prepmetrics.io', password: 'demo1234', role: 'user' });
  console.log('Users created');

  // Subjects
  const subjects = await Subject.insertMany(SUBJECTS);
  const subMap = Object.fromEntries(subjects.map(s => [s.slug, s._id]));
  console.log('Subjects created');

  // Topics per subject
  const topicDefs = [
    { name: 'Number System',        subject: 'aptitude' },
    { name: 'Percentages',          subject: 'aptitude' },
    { name: 'Logical Reasoning',    subject: 'aptitude' },
    { name: 'Time & Work',          subject: 'aptitude' },
    { name: 'Normalization',        subject: 'dbms' },
    { name: 'Transactions & ACID',  subject: 'dbms' },
    { name: 'ER Diagrams',          subject: 'dbms' },
    { name: 'Inheritance',          subject: 'oops' },
    { name: 'Polymorphism',         subject: 'oops' },
    { name: 'Encapsulation',        subject: 'oops' },
    { name: 'Arrays & Strings',     subject: 'dsa' },
    { name: 'Trees & Graphs',       subject: 'dsa' },
    { name: 'Sorting Algorithms',   subject: 'dsa' },
    { name: 'Dynamic Programming',  subject: 'dsa' },
    { name: 'OSI Model',            subject: 'cn' },
    { name: 'TCP/IP',               subject: 'cn' },
    { name: 'DNS & HTTP',           subject: 'cn' },
    { name: 'SELECT Queries',       subject: 'sql' },
    { name: 'Joins',                subject: 'sql' },
    { name: 'Indexes & Views',      subject: 'sql' },
    { name: 'Python Basics',        subject: 'python' },
    { name: 'OOP in Python',        subject: 'python' },
    { name: 'Java Collections',     subject: 'java' },
    { name: 'Multithreading',       subject: 'java' },
    { name: 'Pointers in C',        subject: 'c-cpp' },
    { name: 'STL in C++',           subject: 'c-cpp' },
    { name: 'Network Security',     subject: 'cybersec' },
    { name: 'Cryptography',         subject: 'cybersec' },
    { name: 'SDLC Models',          subject: 'se' },
    { name: 'Agile & Scrum',        subject: 'se' },
    { name: 'Average', subject: 'aptitude' },
{ name: 'Profit Loss & Interest', subject: 'aptitude' },
{ name: 'Ratio & Proportion', subject: 'aptitude' },
{ name: 'Speed Time Distance', subject: 'aptitude' },

{ name: 'Keys', subject: 'dbms' },
{ name: 'DDL', subject: 'dbms' },
{ name: 'Introduction', subject: 'dbms' },

{ name: 'Abstraction', subject: 'oops' },
{ name: 'Access Modifiers', subject: 'oops' },
{ name: 'Classes & Objects', subject: 'oops' },

{ name: 'Trees', subject: 'dsa' },
{ name: 'Graphs', subject: 'dsa' },
{ name: 'Hashing', subject: 'dsa' },

{ name: 'Networking Devices', subject: 'cn' },
{ name: 'IP Addressing', subject: 'cn' },
{ name: 'Network Topologies', subject: 'cn' },
{ name: 'Application Layer Protocols', subject: 'cn' },
{ name: 'MAC Addressing', subject: 'cn' },

{ name: 'Aggregate Functions', subject: 'sql' },
{ name: 'DML Commands', subject: 'sql' },
{ name: 'Constraints', subject: 'sql' },
{ name: 'DDL Commands', subject: 'sql' },

{ name: 'Data Types', subject: 'python' },
{ name: 'Exception Handling', subject: 'python' },
{ name: 'Data Structures', subject: 'python' },
{ name: 'OOP', subject: 'python' },
{ name: 'Operators', subject: 'python' },

{ name: 'Software Design', subject: 'se' },
{ name: 'Software Testing', subject: 'se' },
{ name: 'Requirements Engineering', subject: 'se' },
{ name: 'Version Control', subject: 'se' },
{ name: 'Software Maintenance', subject: 'se' },
{ name: 'Inheritance', subject: 'java' },
{ name: 'Collections Framework', subject: 'java' },
{ name: 'JVM', subject: 'java' },
{ name: 'Polymorphism', subject: 'java' },
{ name: 'Java Basics', subject: 'java' },
{ name: 'Exception Handling', subject: 'java' },
{ name: 'Classes & Objects', subject: 'java' },
{ name: 'Access Modifiers', subject: 'java' },
{ name: 'Packages', subject: 'java' },
{ name: 'Interfaces', subject: 'java' },
{ name: 'Pointers', subject: 'c-cpp' },
{ name: 'Data Types', subject: 'c-cpp' },
{ name: 'Memory Management', subject: 'c-cpp' },
{ name: 'Functions', subject: 'c-cpp' },
{ name: 'OOP in C++', subject: 'c-cpp' },
{ name: 'Operators', subject: 'c-cpp' },
{ name: 'STL', subject: 'c-cpp' },
{ name: 'Classes & Objects', subject: 'c-cpp' },
{ name: 'Inheritance', subject: 'c-cpp' }
  ];

  const topics = await Topic.insertMany(topicDefs.map(t => ({ ...t, subject: subMap[t.subject] })));
  const topicMap = Object.fromEntries(topics.map(t => [t.name, t._id]));
  console.log('Topics created');

  // Sample Questions
  const questions = [
    // Aptitude
    { text: 'A train 150m long passes a pole in 15 seconds. What is its speed in km/h?', type: 'aptitude', difficulty: 'easy', subject: subMap['aptitude'], topic: topicMap['Number System'], options: [{ text: '36 km/h', isCorrect: true }, { text: '40 km/h' }, { text: '54 km/h' }, { text: '60 km/h' }], explanation: 'Speed = 150/15 = 10 m/s = 36 km/h', timeLimitSec: 90 },
    { text: 'What is 30% of 250?', type: 'aptitude', difficulty: 'easy', subject: subMap['aptitude'], topic: topicMap['Percentages'], options: [{ text: '75', isCorrect: true }, { text: '70' }, { text: '80' }, { text: '85' }], explanation: '30/100 × 250 = 75', timeLimitSec: 60 },
    { text: 'If A can complete a job in 12 days and B in 18 days, how many days to complete together?', type: 'aptitude', difficulty: 'medium', subject: subMap['aptitude'], topic: topicMap['Time & Work'], options: [{ text: '7.2 days', isCorrect: true }, { text: '6 days' }, { text: '8 days' }, { text: '9 days' }], explanation: 'Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days', timeLimitSec: 120 },
    { text:'The average of 10,20,30,40,50 is?', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Average'], options:[{text:'30',isCorrect:true},{text:'25'},{text:'35'},{text:'20'}], explanation:'150/5=30', timeLimitSec:45 },
{ text:'Simple interest on ₹1000 at 10% for 2 years?', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Profit Loss & Interest'], options:[{text:'200',isCorrect:true},{text:'100'},{text:'150'},{text:'250'}], explanation:'SI=P×R×T/100', timeLimitSec:60 },
{ text:'Find 25% of 480.', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Percentages'], options:[{text:'120',isCorrect:true},{text:'100'},{text:'140'},{text:'160'}], explanation:'480/4=120', timeLimitSec:45 },
{ text:'A can do a job in 12 days and B in 18 days. Together?', type:'aptitude', difficulty:'medium', subject:subMap['aptitude'], topic:topicMap['Time & Work'], options:[{text:'7.2 days',isCorrect:true},{text:'8 days'},{text:'6 days'},{text:'9 days'}], explanation:'Combined rate=5/36', timeLimitSec:120 },
{ text:'Ratio of 20 to 50 is?', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Ratio & Proportion'], options:[{text:'2:5',isCorrect:true},{text:'5:2'},{text:'4:5'},{text:'1:5'}], explanation:'20:50=2:5', timeLimitSec:45 },
{ text:'If CP=500 and SP=600, profit percentage?', type:'aptitude', difficulty:'medium', subject:subMap['aptitude'], topic:topicMap['Profit Loss & Interest'], options:[{text:'20%',isCorrect:true},{text:'25%'},{text:'15%'},{text:'10%'}], explanation:'100/500×100', timeLimitSec:60 },
{ text:'A number increased by 20% becomes 120. Original number?', type:'aptitude', difficulty:'medium', subject:subMap['aptitude'], topic:topicMap['Percentages'], options:[{text:'100',isCorrect:true},{text:'90'},{text:'80'},{text:'110'}], explanation:'120/1.2=100', timeLimitSec:90 },
{ text:'What is the HCF of 12 and 18?', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Number System'], options:[{text:'6',isCorrect:true},{text:'3'},{text:'12'},{text:'18'}], explanation:'Highest common factor is 6', timeLimitSec:45 },
{ text:'LCM of 4 and 6?', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Number System'], options:[{text:'12',isCorrect:true},{text:'24'},{text:'8'},{text:'6'}], explanation:'LCM=12', timeLimitSec:45 },
{ text:'If selling price equals cost price, profit is?', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Profit Loss & Interest'], options:[{text:'0%',isCorrect:true},{text:'10%'},{text:'5%'},{text:'20%'}], explanation:'No profit no loss', timeLimitSec:30 },
{ text:'Average of first five natural numbers?', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Average'], options:[{text:'3',isCorrect:true},{text:'2'},{text:'4'},{text:'5'}], explanation:'15/5=3', timeLimitSec:30 },
{ text:'A train covers 180 km in 3 hours. Speed?', type:'aptitude', difficulty:'easy', subject:subMap['aptitude'], topic:topicMap['Speed Time Distance'], options:[{text:'60 km/h',isCorrect:true},{text:'50 km/h'},{text:'70 km/h'},{text:'80 km/h'}], explanation:'180/3=60', timeLimitSec:45 },

    // DBMS
    { text: 'Which normal form eliminates transitive dependencies?', type: 'conceptual', difficulty: 'medium', subject: subMap['dbms'], topic: topicMap['Normalization'], options: [{ text: '3NF', isCorrect: true }, { text: '1NF' }, { text: '2NF' }, { text: 'BCNF' }], explanation: '3NF removes transitive functional dependencies', timeLimitSec: 60 },
    { text: 'Which ACID property ensures a transaction is fully completed or not at all?', type: 'conceptual', difficulty: 'easy', subject: subMap['dbms'], topic: topicMap['Transactions & ACID'], options: [{ text: 'Atomicity', isCorrect: true }, { text: 'Consistency' }, { text: 'Isolation' }, { text: 'Durability' }], explanation: 'Atomicity guarantees all-or-nothing execution', timeLimitSec: 60 },
    { text:'Which key uniquely identifies a record?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['Keys'], options:[{text:'Primary Key',isCorrect:true},{text:'Foreign Key'},{text:'Composite Key'},{text:'Candidate Key'}], explanation:'Primary key uniquely identifies rows', timeLimitSec:45 },
{ text:'Which SQL command removes a table and its structure?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['DDL'], options:[{text:'DROP',isCorrect:true},{text:'DELETE'},{text:'REMOVE'},{text:'TRUNCATE'}], explanation:'DROP removes table completely', timeLimitSec:45 },
{ text:'Which normal form removes partial dependency?', type:'conceptual', difficulty:'medium', subject:subMap['dbms'], topic:topicMap['Normalization'], options:[{text:'2NF',isCorrect:true},{text:'1NF'},{text:'3NF'},{text:'BCNF'}], explanation:'2NF removes partial dependency', timeLimitSec:60 },
{ text:'A foreign key is used to?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['Keys'], options:[{text:'Maintain relationships',isCorrect:true},{text:'Store duplicates'},{text:'Index data'},{text:'Encrypt data'}], explanation:'Foreign keys create relationships', timeLimitSec:45 },
{ text:'Which language is used to define schema?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['DDL'], options:[{text:'DDL',isCorrect:true},{text:'DML'},{text:'DCL'},{text:'TCL'}], explanation:'DDL defines schema', timeLimitSec:45 },
{ text:'Which command removes all rows but keeps structure?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['DDL'], options:[{text:'TRUNCATE',isCorrect:true},{text:'DROP'},{text:'DELETE'},{text:'REMOVE'}], explanation:'TRUNCATE keeps table structure', timeLimitSec:45 },
{ text:'Which join returns matching records only?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['Joins'], options:[{text:'INNER JOIN',isCorrect:true},{text:'LEFT JOIN'},{text:'RIGHT JOIN'},{text:'FULL JOIN'}], explanation:'Only matching rows', timeLimitSec:45 },
{ text:'Which level prevents dirty reads?', type:'conceptual', difficulty:'medium', subject:subMap['dbms'], topic:topicMap['Transactions & ACID'], options:[{text:'Read Committed',isCorrect:true},{text:'Read Uncommitted'},{text:'Serializable'},{text:'Repeatable Read'}], explanation:'Read committed avoids dirty reads', timeLimitSec:60 },
{ text:'What does DBMS stand for?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['Introduction'], options:[{text:'Database Management System',isCorrect:true},{text:'Data Backup Management System'},{text:'Database Modeling System'},{text:'Data Management Service'}], explanation:'Full form of DBMS', timeLimitSec:30 },
{ text:'Which normal form removes multivalued dependency?', type:'conceptual', difficulty:'hard', subject:subMap['dbms'], topic:topicMap['Normalization'], options:[{text:'4NF',isCorrect:true},{text:'3NF'},{text:'BCNF'},{text:'2NF'}], explanation:'4NF removes MVD', timeLimitSec:60 },
{ text:'A candidate key is?', type:'conceptual', difficulty:'medium', subject:subMap['dbms'], topic:topicMap['Keys'], options:[{text:'Minimal super key',isCorrect:true},{text:'Foreign key'},{text:'Primary key only'},{text:'Composite key'}], explanation:'Candidate key is minimal super key', timeLimitSec:60 },
{ text:'Which join returns all rows from left table?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['Joins'], options:[{text:'LEFT JOIN',isCorrect:true},{text:'RIGHT JOIN'},{text:'INNER JOIN'},{text:'FULL JOIN'}], explanation:'All rows from left table', timeLimitSec:45 },
{ text:'Which ACID property ensures committed data survives failures?', type:'conceptual', difficulty:'easy', subject:subMap['dbms'], topic:topicMap['Transactions & ACID'], options:[{text:'Durability',isCorrect:true},{text:'Atomicity'},{text:'Isolation'},{text:'Consistency'}], explanation:'Durability persists data', timeLimitSec:45 },

    // OOP
    { text: 'Which OOP concept allows a class to have multiple methods with the same name but different parameters?', type: 'conceptual', difficulty: 'easy', subject: subMap['oops'], topic: topicMap['Polymorphism'], options: [{ text: 'Method Overloading', isCorrect: true }, { text: 'Method Overriding' }, { text: 'Encapsulation' }, { text: 'Abstraction' }], explanation: 'Overloading is compile-time polymorphism', timeLimitSec: 60 },
    { text: 'What keyword is used in Java to prevent a method from being overridden?', type: 'conceptual', difficulty: 'medium', subject: subMap['oops'], topic: topicMap['Inheritance'], options: [{ text: 'final', isCorrect: true }, { text: 'static' }, { text: 'abstract' }, { text: 'private' }], explanation: 'The final keyword prevents subclass overriding', timeLimitSec: 60 },
    { text:'Which keyword prevents overriding in Java?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Inheritance'], options:[{text:'final',isCorrect:true},{text:'static'},{text:'private'},{text:'abstract'}], explanation:'final blocks overriding', timeLimitSec:45 },
{ text:'Inheritance represents which relationship?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Inheritance'], options:[{text:'IS-A',isCorrect:true},{text:'HAS-A'},{text:'USES-A'},{text:'PART-OF'}], explanation:'Inheritance models IS-A', timeLimitSec:45 },
{ text:'Which concept hides implementation details?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Abstraction'], options:[{text:'Abstraction',isCorrect:true},{text:'Inheritance'},{text:'Polymorphism'},{text:'Composition'}], explanation:'Abstraction hides complexity', timeLimitSec:45 },
{ text:'Runtime polymorphism is achieved through?', type:'conceptual', difficulty:'medium', subject:subMap['oops'], topic:topicMap['Polymorphism'], options:[{text:'Method Overriding',isCorrect:true},{text:'Method Overloading'},{text:'Constructors'},{text:'Interfaces only'}], explanation:'Overriding enables runtime polymorphism', timeLimitSec:60 },
{ text:'Which access modifier provides maximum visibility?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Access Modifiers'], options:[{text:'public',isCorrect:true},{text:'private'},{text:'protected'},{text:'default'}], explanation:'public is accessible everywhere', timeLimitSec:45 },
{ text:'A class can inherit from multiple classes in Java?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Inheritance'], options:[{text:'No',isCorrect:true},{text:'Yes'},{text:'Only abstract classes'},{text:'Only interfaces'}], explanation:'Java does not support multiple class inheritance', timeLimitSec:45 },
{ text:'Constructor name should be?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Classes & Objects'], options:[{text:'Same as class name',isCorrect:true},{text:'Any name'},{text:'main'},{text:'init'}], explanation:'Constructor matches class name', timeLimitSec:45 },
{ text:'Object is an instance of?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Classes & Objects'], options:[{text:'Class',isCorrect:true},{text:'Method'},{text:'Interface'},{text:'Package'}], explanation:'Objects are instances of classes', timeLimitSec:30 },
{ text:'Which keyword refers to current object?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Classes & Objects'], options:[{text:'this',isCorrect:true},{text:'self'},{text:'super'},{text:'current'}], explanation:'this refers to current object', timeLimitSec:30 },
{ text:'Which keyword refers to parent class members?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Inheritance'], options:[{text:'super',isCorrect:true},{text:'this'},{text:'parent'},{text:'base'}], explanation:'super accesses parent members', timeLimitSec:30 },
{ text:'Can abstract classes have constructors?', type:'conceptual', difficulty:'medium', subject:subMap['oops'], topic:topicMap['Abstraction'], options:[{text:'Yes',isCorrect:true},{text:'No'},{text:'Only protected'},{text:'Only private'}], explanation:'Abstract classes can have constructors', timeLimitSec:60 },
{ text:'Which principle promotes code reuse?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Inheritance'], options:[{text:'Inheritance',isCorrect:true},{text:'Encapsulation'},{text:'Abstraction'},{text:'Overloading'}], explanation:'Inheritance reuses code', timeLimitSec:45 },
{ text:'Which OOP feature allows one interface many implementations?', type:'conceptual', difficulty:'easy', subject:subMap['oops'], topic:topicMap['Polymorphism'], options:[{text:'Polymorphism',isCorrect:true},{text:'Encapsulation'},{text:'Inheritance'},{text:'Aggregation'}], explanation:'Polymorphism means many forms', timeLimitSec:45 },

    // DSA
    { text: 'What is the time complexity of binary search?', type: 'conceptual', difficulty: 'easy', subject: subMap['dsa'], topic: topicMap['Sorting Algorithms'], options: [{ text: 'O(log n)', isCorrect: true }, { text: 'O(n)' }, { text: 'O(n log n)' }, { text: 'O(1)' }], explanation: 'Binary search halves the search space each step', timeLimitSec: 60 },
    { text: 'Which data structure uses LIFO order?', type: 'conceptual', difficulty: 'easy', subject: subMap['dsa'], topic: topicMap['Arrays & Strings'], options: [{ text: 'Stack', isCorrect: true }, { text: 'Queue' }, { text: 'Linked List' }, { text: 'Heap' }], explanation: 'Stack = Last In First Out', timeLimitSec: 45 },
    { text: 'What is the worst-case time complexity of QuickSort?', type: 'conceptual', difficulty: 'medium', subject: subMap['dsa'], topic: topicMap['Sorting Algorithms'], options: [{ text: 'O(n²)', isCorrect: true }, { text: 'O(n log n)' }, { text: 'O(n)' }, { text: 'O(log n)' }], explanation: 'When pivot is always min/max element, O(n²) occurs', timeLimitSec: 60 },
    { text:'Which traversal visits Root-Left-Right?', type:'conceptual', difficulty:'easy', subject:subMap['dsa'], topic:topicMap['Trees'], options:[{text:'Preorder',isCorrect:true},{text:'Inorder'},{text:'Postorder'},{text:'Level Order'}], explanation:'Preorder = Root Left Right', timeLimitSec:45 },
{ text:'Which data structure is used for BFS?', type:'conceptual', difficulty:'easy', subject:subMap['dsa'], topic:topicMap['Graphs'], options:[{text:'Queue',isCorrect:true},{text:'Stack'},{text:'Heap'},{text:'Array'}], explanation:'BFS uses queue', timeLimitSec:45 },
{ text:'Which data structure is used for DFS?', type:'conceptual', difficulty:'easy', subject:subMap['dsa'], topic:topicMap['Graphs'], options:[{text:'Stack',isCorrect:true},{text:'Queue'},{text:'Heap'},{text:'Linked List'}], explanation:'DFS uses stack', timeLimitSec:45 },
{ text:'Average complexity of Hash Table search?', type:'conceptual', difficulty:'easy', subject:subMap['dsa'], topic:topicMap['Hashing'], options:[{text:'O(1)',isCorrect:true},{text:'O(log n)'},{text:'O(n)'},{text:'O(n²)'}], explanation:'Constant average lookup', timeLimitSec:45 },
{ text:'Which sorting algorithm is stable?', type:'conceptual', difficulty:'medium', subject:subMap['dsa'], topic:topicMap['Sorting Algorithms'], options:[{text:'Merge Sort',isCorrect:true},{text:'Quick Sort'},{text:'Heap Sort'},{text:'Selection Sort'}], explanation:'Merge sort preserves order', timeLimitSec:60 },
{ text:'Height of a balanced BST with n nodes?', type:'conceptual', difficulty:'medium', subject:subMap['dsa'], topic:topicMap['Trees'], options:[{text:'O(log n)',isCorrect:true},{text:'O(n)'},{text:'O(1)'},{text:'O(n log n)'}], explanation:'Balanced BST height is logarithmic', timeLimitSec:60 },
{ text:'Which algorithm finds shortest path in weighted graphs with non-negative weights?', type:'conceptual', difficulty:'medium', subject:subMap['dsa'], topic:topicMap['Graphs'], options:[{text:'Dijkstra',isCorrect:true},{text:'DFS'},{text:'BFS'},{text:'Prim'}], explanation:'Dijkstra shortest path algorithm', timeLimitSec:60 },

    // CN
    { text: 'Which layer of the OSI model is responsible for routing packets?', type: 'conceptual', difficulty: 'easy', subject: subMap['cn'], topic: topicMap['OSI Model'], options: [{ text: 'Network Layer', isCorrect: true }, { text: 'Transport Layer' }, { text: 'Data Link Layer' }, { text: 'Session Layer' }], explanation: 'The Network Layer handles logical addressing and routing.', timeLimitSec: 45 },

{ text: 'What is the default port number for HTTP?', type: 'conceptual', difficulty: 'easy', subject: subMap['cn'], topic: topicMap['TCP/IP'], options: [{ text: '80', isCorrect: true }, { text: '21' }, { text: '443' }, { text: '25' }], explanation: 'HTTP uses port 80 by default.', timeLimitSec: 45 },

{ text: 'Which protocol translates domain names into IP addresses?', type: 'conceptual', difficulty: 'easy', subject: subMap['cn'], topic: topicMap['TCP/IP'], options: [{ text: 'DNS', isCorrect: true }, { text: 'DHCP' }, { text: 'ARP' }, { text: 'FTP' }], explanation: 'DNS resolves domain names to IP addresses.', timeLimitSec: 45 },

{ text: 'Which device operates primarily at the Data Link layer?', type: 'conceptual', difficulty: 'medium', subject: subMap['cn'], topic: topicMap['Networking Devices'], options: [{ text: 'Switch', isCorrect: true }, { text: 'Router' }, { text: 'Hub' }, { text: 'Gateway' }], explanation: 'Switches use MAC addresses and operate at Layer 2.', timeLimitSec: 60 },

{ text: 'What is the size of an IPv4 address?', type: 'conceptual', difficulty: 'easy', subject: subMap['cn'], topic: topicMap['IP Addressing'], options: [{ text: '32 bits', isCorrect: true }, { text: '64 bits' }, { text: '128 bits' }, { text: '16 bits' }], explanation: 'IPv4 addresses are 32-bit numbers.', timeLimitSec: 45 },

{ text: 'Which protocol is connection-oriented?', type: 'conceptual', difficulty: 'easy', subject: subMap['cn'], topic: topicMap['TCP/IP'], options: [{ text: 'TCP', isCorrect: true }, { text: 'UDP' }, { text: 'ICMP' }, { text: 'ARP' }], explanation: 'TCP establishes a connection before data transfer.', timeLimitSec: 45 },

{ text: 'What does NAT stand for?', type: 'conceptual', difficulty: 'medium', subject: subMap['cn'], topic: topicMap['IP Addressing'], options: [{ text: 'Network Address Translation', isCorrect: true }, { text: 'Network Access Transfer' }, { text: 'Node Address Translation' }, { text: 'Network Allocation Table' }], explanation: 'NAT translates private IP addresses to public IP addresses.', timeLimitSec: 60 },

{ text: 'Which topology connects every node to every other node?', type: 'conceptual', difficulty: 'medium', subject: subMap['cn'], topic: topicMap['Network Topologies'], options: [{ text: 'Mesh', isCorrect: true }, { text: 'Bus' }, { text: 'Ring' }, { text: 'Star' }], explanation: 'In a mesh topology every node has a direct link to all others.', timeLimitSec: 60 },

{ text: 'Which protocol is used to send emails?', type: 'conceptual', difficulty: 'easy', subject: subMap['cn'], topic: topicMap['Application Layer Protocols'], options: [{ text: 'SMTP', isCorrect: true }, { text: 'POP3' }, { text: 'IMAP' }, { text: 'FTP' }], explanation: 'SMTP is used for sending email messages.', timeLimitSec: 45 },

{ text: 'How many bits are there in a MAC address?', type: 'conceptual', difficulty: 'medium', subject: subMap['cn'], topic: topicMap['MAC Addressing'], options: [{ text: '48 bits', isCorrect: true }, { text: '32 bits' }, { text: '64 bits' }, { text: '128 bits' }], explanation: 'A MAC address is typically 48 bits long.', timeLimitSec: 60 },
    // SQL
    { text: 'Which SQL clause is used to filter records?', type: 'conceptual', difficulty: 'easy', subject: subMap['sql'], topic: topicMap['SELECT Queries'], options: [{ text: 'WHERE', isCorrect: true }, { text: 'HAVING' }, { text: 'GROUP BY' }, { text: 'ORDER BY' }], explanation: 'WHERE filters rows before grouping', timeLimitSec: 45 },
    { text: 'Which type of JOIN returns all rows from both tables, with NULLs where no match?', type: 'conceptual', difficulty: 'medium', subject: subMap['sql'], topic: topicMap['Joins'], options: [{ text: 'FULL OUTER JOIN', isCorrect: true }, { text: 'INNER JOIN' }, { text: 'LEFT JOIN' }, { text: 'CROSS JOIN' }], explanation: 'FULL OUTER JOIN includes unmatched rows from both tables', timeLimitSec: 60 },
    { text: 'Which SQL clause is used to sort query results?', type: 'conceptual', difficulty: 'easy', subject: subMap['sql'], topic: topicMap['SELECT Queries'], options: [{ text: 'ORDER BY', isCorrect: true }, { text: 'GROUP BY' }, { text: 'WHERE' }, { text: 'HAVING' }], explanation: 'ORDER BY sorts rows in ascending or descending order.', timeLimitSec: 45 },

{ text: 'Which SQL function returns the total number of rows?', type: 'conceptual', difficulty: 'easy', subject: subMap['sql'], topic: topicMap['Aggregate Functions'], options: [{ text: 'COUNT()', isCorrect: true }, { text: 'SUM()' }, { text: 'AVG()' }, { text: 'MAX()' }], explanation: 'COUNT() returns the number of rows matching the condition.', timeLimitSec: 45 },

{ text: 'Which JOIN returns only matching rows from both tables?', type: 'conceptual', difficulty: 'easy', subject: subMap['sql'], topic: topicMap['Joins'], options: [{ text: 'INNER JOIN', isCorrect: true }, { text: 'LEFT JOIN' }, { text: 'RIGHT JOIN' }, { text: 'FULL OUTER JOIN' }], explanation: 'INNER JOIN returns rows with matching values in both tables.', timeLimitSec: 45 },

{ text: 'Which clause is used to group rows that have the same values?', type: 'conceptual', difficulty: 'easy', subject: subMap['sql'], topic: topicMap['Aggregate Functions'], options: [{ text: 'GROUP BY', isCorrect: true }, { text: 'ORDER BY' }, { text: 'WHERE' }, { text: 'DISTINCT' }], explanation: 'GROUP BY groups rows sharing common column values.', timeLimitSec: 45 },

{ text: 'Which keyword removes duplicate rows from a result set?', type: 'conceptual', difficulty: 'easy', subject: subMap['sql'], topic: topicMap['SELECT Queries'], options: [{ text: 'DISTINCT', isCorrect: true }, { text: 'UNIQUE' }, { text: 'REMOVE' }, { text: 'FILTER' }], explanation: 'DISTINCT eliminates duplicate records from query results.', timeLimitSec: 45 },

{ text: 'Which SQL statement is used to add new records into a table?', type: 'conceptual', difficulty: 'easy', subject: subMap['sql'], topic: topicMap['DML Commands'], options: [{ text: 'INSERT INTO', isCorrect: true }, { text: 'UPDATE' }, { text: 'ALTER' }, { text: 'CREATE' }], explanation: 'INSERT INTO adds new rows to a table.', timeLimitSec: 45 },

{ text: 'Which constraint ensures that a column cannot contain NULL values?', type: 'conceptual', difficulty: 'medium', subject: subMap['sql'], topic: topicMap['Constraints'], options: [{ text: 'NOT NULL', isCorrect: true }, { text: 'UNIQUE' }, { text: 'CHECK' }, { text: 'DEFAULT' }], explanation: 'NOT NULL prevents null values from being inserted.', timeLimitSec: 60 },

{ text: 'Which SQL command is used to modify the structure of an existing table?', type: 'conceptual', difficulty: 'medium', subject: subMap['sql'], topic: topicMap['DDL Commands'], options: [{ text: 'ALTER TABLE', isCorrect: true }, { text: 'UPDATE TABLE' }, { text: 'MODIFY TABLE' }, { text: 'CHANGE TABLE' }], explanation: 'ALTER TABLE changes the schema of an existing table.', timeLimitSec: 60 },

{ text: 'Which clause is used to filter grouped records after aggregation?', type: 'conceptual', difficulty: 'medium', subject: subMap['sql'], topic: topicMap['Aggregate Functions'], options: [{ text: 'HAVING', isCorrect: true }, { text: 'WHERE' }, { text: 'ORDER BY' }, { text: 'LIMIT' }], explanation: 'HAVING filters groups after GROUP BY processing.', timeLimitSec: 60 },

{ text: 'What is the primary purpose of a PRIMARY KEY?', type: 'conceptual', difficulty: 'easy', subject: subMap['sql'], topic: topicMap['Constraints'], options: [{ text: 'Uniquely identify each row', isCorrect: true }, { text: 'Store duplicate values' }, { text: 'Sort records automatically' }, { text: 'Allow NULL values' }], explanation: 'A PRIMARY KEY uniquely identifies every record in a table.', timeLimitSec: 45 },
    // Python
    { text: 'Which Python keyword is used to define a generator function?', type: 'conceptual', difficulty: 'medium', subject: subMap['python'], topic: topicMap['Python Basics'], options: [{ text: 'yield', isCorrect: true }, { text: 'return' }, { text: 'async' }, { text: 'lambda' }], explanation: 'yield makes a function a generator', timeLimitSec: 60 },
    { text: 'Which keyword is used to define a function in Python?', type: 'conceptual', difficulty: 'easy', subject: subMap['python'], topic: topicMap['Python Basics'], options: [{ text: 'def', isCorrect: true }, { text: 'function' }, { text: 'fun' }, { text: 'define' }], explanation: 'Functions in Python are declared using the def keyword.', timeLimitSec: 45 },

{ text: 'Which data type is immutable in Python?', type: 'conceptual', difficulty: 'easy', subject: subMap['python'], topic: topicMap['Data Types'], options: [{ text: 'Tuple', isCorrect: true }, { text: 'List' }, { text: 'Set' }, { text: 'Dictionary' }], explanation: 'Tuples cannot be modified after creation.', timeLimitSec: 45 },

{ text: 'What is the output type of len("Python")?', type: 'conceptual', difficulty: 'easy', subject: subMap['python'], topic: topicMap['Python Basics'], options: [{ text: 'int', isCorrect: true }, { text: 'str' }, { text: 'float' }, { text: 'bool' }], explanation: 'len() returns an integer representing the number of items.', timeLimitSec: 45 },

{ text: 'Which keyword is used to handle exceptions?', type: 'conceptual', difficulty: 'easy', subject: subMap['python'], topic: topicMap['Exception Handling'], options: [{ text: 'try', isCorrect: true }, { text: 'catch' }, { text: 'handle' }, { text: 'error' }], explanation: 'Python uses try-except blocks for exception handling.', timeLimitSec: 45 },

{ text: 'Which Python collection stores key-value pairs?', type: 'conceptual', difficulty: 'easy', subject: subMap['python'], topic: topicMap['Data Structures'], options: [{ text: 'Dictionary', isCorrect: true }, { text: 'List' }, { text: 'Tuple' }, { text: 'Set' }], explanation: 'Dictionaries store data as key-value pairs.', timeLimitSec: 45 },

{ text: 'Which keyword is used to create a class in Python?', type: 'conceptual', difficulty: 'easy', subject: subMap['python'], topic: topicMap['OOP'], options: [{ text: 'class', isCorrect: true }, { text: 'object' }, { text: 'struct' }, { text: 'new' }], explanation: 'The class keyword is used to define classes.', timeLimitSec: 45 },

{ text: 'Which method adds a single element to the end of a list?', type: 'conceptual', difficulty: 'medium', subject: subMap['python'], topic: topicMap['Data Structures'], options: [{ text: 'append()', isCorrect: true }, { text: 'extend()' }, { text: 'insertAll()' }, { text: 'push()' }], explanation: 'append() adds one element to the end of a list.', timeLimitSec: 60 },

{ text: 'What is the output of type(True)?', type: 'conceptual', difficulty: 'easy', subject: subMap['python'], topic: topicMap['Data Types'], options: [{ text: 'bool', isCorrect: true }, { text: 'int' }, { text: 'str' }, { text: 'float' }], explanation: 'True is a boolean value in Python.', timeLimitSec: 45 },

{ text: 'Which operator is used for exponentiation in Python?', type: 'conceptual', difficulty: 'medium', subject: subMap['python'], topic: topicMap['Operators'], options: [{ text: '**', isCorrect: true }, { text: '^' }, { text: '^^' }, { text: 'exp' }], explanation: 'The ** operator performs exponentiation.', timeLimitSec: 60 },

{ text: 'What is the purpose of the pass statement?', type: 'conceptual', difficulty: 'medium', subject: subMap['python'], topic: topicMap['Python Basics'], options: [{ text: 'Acts as a placeholder for future code', isCorrect: true }, { text: 'Skips an iteration' }, { text: 'Ends a loop' }, { text: 'Raises an exception' }], explanation: 'pass is a null operation used where syntax requires a statement.', timeLimitSec: 60 },
    // Cyber Security
    { text: 'Which attack involves intercepting communication between two parties?', type: 'conceptual', difficulty: 'medium', subject: subMap['cybersec'], topic: topicMap['Network Security'], options: [{ text: 'Man-in-the-Middle', isCorrect: true }, { text: 'Phishing' }, { text: 'SQL Injection' }, { text: 'DoS' }], explanation: 'MITM attackers secretly relay/alter communications', timeLimitSec: 60 },
    { text: 'What does AES stand for?', type: 'conceptual', difficulty: 'easy', subject: subMap['cybersec'], topic: topicMap['Cryptography'], options: [{ text: 'Advanced Encryption Standard', isCorrect: true }, { text: 'Applied Encryption System' }, { text: 'Automatic Encoding Standard' }, { text: 'Advanced Encoding Syntax' }], explanation: 'AES = Advanced Encryption Standard, NIST 2001', timeLimitSec: 45 },
    // SE
    { text: 'In which SDLC model are requirements frozen before development begins?', type: 'conceptual', difficulty: 'easy', subject: subMap['se'], topic: topicMap['SDLC Models'], options: [{ text: 'Waterfall', isCorrect: true }, { text: 'Agile' }, { text: 'Spiral' }, { text: 'Prototype' }], explanation: 'Waterfall has distinct sequential phases', timeLimitSec: 60 },
    { text: 'Which SDLC phase involves gathering user requirements?', type: 'conceptual', difficulty: 'easy', subject: subMap['se'], topic: topicMap['SDLC Models'], options: [{ text: 'Requirements Analysis', isCorrect: true }, { text: 'Testing' }, { text: 'Deployment' }, { text: 'Maintenance' }], explanation: 'Requirements Analysis focuses on understanding stakeholder needs.', timeLimitSec: 45 },

{ text: 'Which software development model emphasizes iterative development and customer feedback?', type: 'conceptual', difficulty: 'easy', subject: subMap['se'], topic: topicMap['SDLC Models'], options: [{ text: 'Agile', isCorrect: true }, { text: 'Waterfall' }, { text: 'V-Model' }, { text: 'Big Bang' }], explanation: 'Agile delivers software incrementally with continuous feedback.', timeLimitSec: 45 },

{ text: 'What does UML stand for?', type: 'conceptual', difficulty: 'easy', subject: subMap['se'], topic: topicMap['Software Design'], options: [{ text: 'Unified Modeling Language', isCorrect: true }, { text: 'Universal Machine Language' }, { text: 'Unified Machine Logic' }, { text: 'User Modeling Language' }], explanation: 'UML is a standard modeling language for software design.', timeLimitSec: 45 },

{ text: 'Which testing type verifies individual units or components of software?', type: 'conceptual', difficulty: 'easy', subject: subMap['se'], topic: topicMap['Software Testing'], options: [{ text: 'Unit Testing', isCorrect: true }, { text: 'Integration Testing' }, { text: 'System Testing' }, { text: 'Acceptance Testing' }], explanation: 'Unit testing focuses on testing individual components.', timeLimitSec: 45 },

{ text: 'Which document describes the functional and non-functional requirements of a system?', type: 'conceptual', difficulty: 'medium', subject: subMap['se'], topic: topicMap['Requirements Engineering'], options: [{ text: 'SRS', isCorrect: true }, { text: 'UML' }, { text: 'API' }, { text: 'ERD' }], explanation: 'Software Requirement Specification documents system requirements.', timeLimitSec: 60 },

{ text: 'What does DRY stand for in software engineering?', type: 'conceptual', difficulty: 'medium', subject: subMap['se'], topic: topicMap['Software Design'], options: [{ text: 'Dont Repeat Yourself', isCorrect: true }, { text: 'Develop Reusable Yield' }, { text: 'Design Right Yearly' }, { text: 'Data Reuse Yield' }], explanation: 'DRY encourages reducing code duplication.', timeLimitSec: 60 },

{ text: 'Which testing is performed by end users before final release?', type: 'conceptual', difficulty: 'medium', subject: subMap['se'], topic: topicMap['Software Testing'], options: [{ text: 'Acceptance Testing', isCorrect: true }, { text: 'Unit Testing' }, { text: 'Regression Testing' }, { text: 'Smoke Testing' }], explanation: 'Acceptance testing validates software against business requirements.', timeLimitSec: 60 },

{ text: 'What is the primary goal of version control systems like Git?', type: 'conceptual', difficulty: 'easy', subject: subMap['se'], topic: topicMap['Version Control'], options: [{ text: 'Track and manage code changes', isCorrect: true }, { text: 'Compile source code' }, { text: 'Execute programs' }, { text: 'Test applications' }], explanation: 'Version control systems manage and track code history.', timeLimitSec: 45 },

{ text: 'Which design principle states that a class should have only one reason to change?', type: 'conceptual', difficulty: 'hard', subject: subMap['se'], topic: topicMap['Software Design'], options: [{ text: 'Single Responsibility Principle', isCorrect: true }, { text: 'Open Closed Principle' }, { text: 'Dependency Inversion Principle' }, { text: 'Liskov Substitution Principle' }], explanation: 'SRP is the first principle of SOLID design.', timeLimitSec: 75 },

{ text: 'What is software maintenance?', type: 'conceptual', difficulty: 'easy', subject: subMap['se'], topic: topicMap['Software Maintenance'], options: [{ text: 'Modifying software after deployment', isCorrect: true }, { text: 'Writing initial requirements' }, { text: 'Creating UML diagrams' }, { text: 'Compiling source code' }], explanation: 'Maintenance includes fixing bugs and improving deployed software.', timeLimitSec: 45 },
    // =========================
// C/C++ (15 Questions)
// =========================

{
  text: 'Which operator is used to access a member through a pointer in C++?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['Pointers'],
  options: [
    { text: '->', isCorrect: true },
    { text: '.' },
    { text: '*' },
    { text: '&' }
  ],
  explanation: 'The arrow operator accesses members through a pointer.',
  timeLimitSec: 45
},

{
  text: 'What is the size of char in C/C++?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['Data Types'],
  options: [
    { text: '1 byte', isCorrect: true },
    { text: '2 bytes' },
    { text: '4 bytes' },
    { text: 'Depends on compiler' }
  ],
  explanation: 'char always occupies 1 byte.',
  timeLimitSec: 45
},

{
  text: 'Which keyword is used to allocate memory dynamically in C++?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['Memory Management'],
  options: [
    { text: 'new', isCorrect: true },
    { text: 'malloc' },
    { text: 'alloc' },
    { text: 'create' }
  ],
  explanation: 'new allocates memory dynamically in C++.',
  timeLimitSec: 45
},

{
  text: 'What is function overloading?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['c-cpp'],
  topic: topicMap['Functions'],
  options: [
    { text: 'Multiple functions with same name but different parameters', isCorrect: true },
    { text: 'Calling function recursively' },
    { text: 'Using function pointers' },
    { text: 'Multiple return values' }
  ],
  explanation: 'Overloading allows same function name with different signatures.',
  timeLimitSec: 60
},

{
  text: 'Which feature supports runtime polymorphism in C++?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['c-cpp'],
  topic: topicMap['OOP in C++'],
  options: [
    { text: 'Virtual Functions', isCorrect: true },
    { text: 'Templates' },
    { text: 'Inline Functions' },
    { text: 'Macros' }
  ],
  explanation: 'Virtual functions enable dynamic dispatch.',
  timeLimitSec: 60
},

{
  text: 'What is the output type of sizeof operator?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['c-cpp'],
  topic: topicMap['Operators'],
  options: [
    { text: 'size_t', isCorrect: true },
    { text: 'int' },
    { text: 'long' },
    { text: 'unsigned int' }
  ],
  explanation: 'sizeof returns size_t.',
  timeLimitSec: 60
},

{
  text: 'Which STL container follows LIFO order?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['STL'],
  options: [
    { text: 'stack', isCorrect: true },
    { text: 'queue' },
    { text: 'vector' },
    { text: 'map' }
  ],
  explanation: 'stack implements Last-In-First-Out.',
  timeLimitSec: 45
},

{
  text: 'What is a dangling pointer?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['c-cpp'],
  topic: topicMap['Pointers'],
  options: [
    { text: 'Pointer pointing to freed memory', isCorrect: true },
    { text: 'Null pointer' },
    { text: 'Pointer to pointer' },
    { text: 'Constant pointer' }
  ],
  explanation: 'Dangling pointers reference deallocated memory.',
  timeLimitSec: 60
},

{
  text: 'Which keyword prevents inheritance?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['c-cpp'],
  topic: topicMap['OOP in C++'],
  options: [
    { text: 'final', isCorrect: true },
    { text: 'const' },
    { text: 'static' },
    { text: 'sealed' }
  ],
  explanation: 'final prevents further inheritance.',
  timeLimitSec: 60
},

{
  text: 'Which header file contains std::vector?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['STL'],
  options: [
    { text: '<vector>', isCorrect: true },
    { text: '<array>' },
    { text: '<list>' },
    { text: '<algorithm>' }
  ],
  explanation: 'vector is defined in <vector>.',
  timeLimitSec: 45
},

{
  text: 'What is the default access specifier in a C++ class?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['Classes & Objects'],
  options: [
    { text: 'private', isCorrect: true },
    { text: 'public' },
    { text: 'protected' },
    { text: 'friend' }
  ],
  explanation: 'Members are private by default in a class.',
  timeLimitSec: 45
},

{
  text: 'Which keyword is used to inherit a class publicly?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['Inheritance'],
  options: [
    { text: 'public', isCorrect: true },
    { text: 'extends' },
    { text: 'inherits' },
    { text: 'friend' }
  ],
  explanation: 'public inheritance preserves access levels.',
  timeLimitSec: 45
},

{
  text: 'Which STL container stores key-value pairs?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['STL'],
  options: [
    { text: 'map', isCorrect: true },
    { text: 'vector' },
    { text: 'stack' },
    { text: 'deque' }
  ],
  explanation: 'map stores ordered key-value pairs.',
  timeLimitSec: 45
},

{
  text: 'What is the complexity of vector push_back() on average?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['c-cpp'],
  topic: topicMap['STL'],
  options: [
    { text: 'O(1)', isCorrect: true },
    { text: 'O(log n)' },
    { text: 'O(n)' },
    { text: 'O(n log n)' }
  ],
  explanation: 'push_back is amortized O(1).',
  timeLimitSec: 60
},

{
  text: 'Which concept allows one interface with multiple implementations?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['c-cpp'],
  topic: topicMap['OOP in C++'],
  options: [
    { text: 'Polymorphism', isCorrect: true },
    { text: 'Encapsulation' },
    { text: 'Inheritance' },
    { text: 'Abstraction' }
  ],
  explanation: 'Polymorphism allows many forms of behavior.',
  timeLimitSec: 45
},
  // =========================
// JAVA (15 Questions)
// =========================

{
  text: 'Which keyword is used to inherit a class in Java?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Inheritance'],
  options: [
    { text: 'extends', isCorrect: true },
    { text: 'implements' },
    { text: 'inherits' },
    { text: 'super' }
  ],
  explanation: 'extends is used for class inheritance.',
  timeLimitSec: 45
},

{
  text: 'Which collection does not allow duplicate elements?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Collections Framework'],
  options: [
    { text: 'Set', isCorrect: true },
    { text: 'List' },
    { text: 'ArrayList' },
    { text: 'Vector' }
  ],
  explanation: 'Set maintains unique elements.',
  timeLimitSec: 45
},

{
  text: 'Which JVM component performs garbage collection?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['java'],
  topic: topicMap['JVM'],
  options: [
    { text: 'Garbage Collector', isCorrect: true },
    { text: 'Class Loader' },
    { text: 'JIT Compiler' },
    { text: 'Bytecode Verifier' }
  ],
  explanation: 'GC automatically frees unused memory.',
  timeLimitSec: 60
},

{
  text: 'Which keyword prevents method overriding?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Polymorphism'],
  options: [
    { text: 'final', isCorrect: true },
    { text: 'static' },
    { text: 'abstract' },
    { text: 'private' }
  ],
  explanation: 'final methods cannot be overridden.',
  timeLimitSec: 45
},

{
  text: 'What is the parent class of all Java classes?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Java Basics'],
  options: [
    { text: 'Object', isCorrect: true },
    { text: 'Class' },
    { text: 'Main' },
    { text: 'Base' }
  ],
  explanation: 'java.lang.Object is the root class.',
  timeLimitSec: 45
},

{
  text: 'Which interface is implemented by ArrayList?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['java'],
  topic: topicMap['Collections Framework'],
  options: [
    { text: 'List', isCorrect: true },
    { text: 'Set' },
    { text: 'Map' },
    { text: 'Queue' }
  ],
  explanation: 'ArrayList implements List.',
  timeLimitSec: 60
},

{
  text: 'Which exception is checked?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['java'],
  topic: topicMap['Exception Handling'],
  options: [
    { text: 'IOException', isCorrect: true },
    { text: 'NullPointerException' },
    { text: 'ArithmeticException' },
    { text: 'ArrayIndexOutOfBoundsException' }
  ],
  explanation: 'IOException must be handled or declared.',
  timeLimitSec: 60
},

{
  text: 'Which keyword refers to the current object?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Classes & Objects'],
  options: [
    { text: 'this', isCorrect: true },
    { text: 'self' },
    { text: 'current' },
    { text: 'super' }
  ],
  explanation: 'this refers to current object instance.',
  timeLimitSec: 45
},

{
  text: 'Which access modifier provides the widest visibility?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Access Modifiers'],
  options: [
    { text: 'public', isCorrect: true },
    { text: 'private' },
    { text: 'protected' },
    { text: 'default' }
  ],
  explanation: 'public members are accessible everywhere.',
  timeLimitSec: 45
},

{
  text: 'Which feature allows multiple methods with the same name but different parameters?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Polymorphism'],
  options: [
    { text: 'Method Overloading', isCorrect: true },
    { text: 'Method Overriding' },
    { text: 'Abstraction' },
    { text: 'Encapsulation' }
  ],
  explanation: 'Overloading occurs at compile time.',
  timeLimitSec: 45
},

{
  text: 'Which package is imported automatically?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Packages'],
  options: [
    { text: 'java.lang', isCorrect: true },
    { text: 'java.util' },
    { text: 'java.io' },
    { text: 'java.net' }
  ],
  explanation: 'java.lang is automatically imported.',
  timeLimitSec: 45
},

{
  text: 'What is the default value of a boolean instance variable?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Java Basics'],
  options: [
    { text: 'false', isCorrect: true },
    { text: 'true' },
    { text: 'null' },
    { text: '0' }
  ],
  explanation: 'boolean defaults to false.',
  timeLimitSec: 45
},

{
  text: 'Which keyword is used to implement an interface?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Interfaces'],
  options: [
    { text: 'implements', isCorrect: true },
    { text: 'extends' },
    { text: 'inherits' },
    { text: 'interface' }
  ],
  explanation: 'implements is used with interfaces.',
  timeLimitSec: 45
},

{
  text: 'Which collection provides key-value storage?',
  type: 'conceptual',
  difficulty: 'easy',
  subject: subMap['java'],
  topic: topicMap['Collections Framework'],
  options: [
    { text: 'HashMap', isCorrect: true },
    { text: 'ArrayList' },
    { text: 'LinkedList' },
    { text: 'HashSet' }
  ],
  explanation: 'HashMap stores key-value pairs.',
  timeLimitSec: 45
},

{
  text: 'What is the time complexity of HashMap lookup on average?',
  type: 'conceptual',
  difficulty: 'medium',
  subject: subMap['java'],
  topic: topicMap['Collections Framework'],
  options: [
    { text: 'O(1)', isCorrect: true },
    { text: 'O(log n)' },
    { text: 'O(n)' },
    { text: 'O(n²)' }
  ],
  explanation: 'HashMap provides average constant-time lookup.',
  timeLimitSec: 60
},
  ];

  const createdQuestions = await Question.insertMany(questions);
  console.log(`${createdQuestions.length} questions created`);

  // Create one quiz per subject (first 5 Qs)
  for (const subj of subjects) {
    const subjectQs = createdQuestions.filter(q => q.subject.toString() === subj._id.toString());
    if (subjectQs.length === 0) continue;
    await Quiz.create({
      title:        `${subj.name} – Starter Quiz`,
      subject:      subj._id,
      difficulty:   'mixed',
      questions:    subjectQs.map(q => q._id),
      isTimed:      true,
      timeLimitMin: Math.max(5, subjectQs.length * 2),
      passingScore: 60,
      createdBy:    admin._id,
    });
  }
  console.log('Quizzes created');

  console.log('\n✅ Seed complete!');
  console.log('Admin:    admin@prepmetrics.io / admin123');
  console.log('Demo:     demo@prepmetrics.io  / demo1234');
  await mongoose.disconnect();
};

seed().catch(e => { console.error(e); process.exit(1); });
