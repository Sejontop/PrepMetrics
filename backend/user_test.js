const User = require('./models/User');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/prepmetrics');

async function testLogin() {
  const user = await User.findOne({ email: 'admin@prepmetrics.com' });
  console.log('User found:', user.name);
  const match = await user.comparePassword('Admin@123');
  console.log('Password match:', match);
}

testLogin();
