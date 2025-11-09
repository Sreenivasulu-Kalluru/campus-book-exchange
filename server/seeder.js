// server/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/book.model');
const User = require('./models/user.model');
const Request = require('./models/request.model');
const Conversation = require('./models/conversation.model');
const Message = require('./models/message.model');

// Load env vars
dotenv.config();

// --- 1. PASTE YOUR USER IDs HERE ---

const USER_ID_1 = '690dc72e4dcb02b2140c3f2c'; // e.g., '690d6c40911bd4b995b45317'
const USER_ID_2 = '690d5c023eb333b8dbfb13f9'; // e.g., '690d7c40911bd4b995b12345'

// ------------------------------------

const books = [
  {
    title: 'Data Structures with Java',
    author: 'John R. Hubbard',
    condition: 'Good',
    lister: USER_ID_1,
    imageUrl:
      'https://m.media-amazon.com/images/I/41fmbBFmJxL._AC_UF1000,1000_QL80_.jpg',
  },
  {
    title: 'Learn MERN Stack Dev',
    author: 'Jonas Schmedtmann',
    condition: 'New',
    lister: USER_ID_1,
    imageUrl:
      'https://m.media-amazon.com/images/I/51fJDInYIFL._AC_UF1000,1000_QL80_.jpg',
  },
  {
    title: 'Modern JavaScript from the Beginning',
    author: 'Brad Traversy',
    condition: 'Used',
    lister: USER_ID_2,
    imageUrl:
      'https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/sites/2147632815/images/a5cb4a8-d7c5-7a35-15ee-1f5aa561cb0_13ec59a1-5fa0-4999-9de1-ed2063a8ad7c.jpg',
  },
  {
    title: 'Operating System Concepts',
    author: 'Silberschatz and Galvin',
    condition: 'New',
    lister: USER_ID_2,
    imageUrl:
      'https://5.imimg.com/data5/SELLER/Default/2023/10/353040175/WA/DB/FC/121408955/operating-system-concepts-international-student-version-paperback.jpg',
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Peter Norvig',
    condition: 'Good',
    lister: USER_ID_1,
    imageUrl:
      'https://m.media-amazon.com/images/I/41DXHTpEq6L._SX342_SY445_ControlCacheEqualizer_.jpg',
  },
  {
    title: 'Grokking Algorithms',
    author: 'Aditya Bhargava',
    condition: 'New',
    lister: USER_ID_1,
    imageUrl:
      'https://m.media-amazon.com/images/I/81HwgKQ39lS._UF1000,1000_QL80_.jpg',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    condition: 'Good',
    lister: USER_ID_2,
    imageUrl:
      'https://m.media-amazon.com/images/I/5187sT8UjmL._SY445_SX342_ControlCacheEqualizer_.jpg',
  },
  {
    title: 'Database System Concepts',
    author: 'Silberschatz and Korth',
    condition: 'Used',
    lister: USER_ID_1,
    imageUrl:
      'https://m.media-amazon.com/images/I/41GejKrblRL._SY445_SX342_ControlCacheEqualizer_.jpg',
  },
  {
    title: "You Don't Know JS Yet: Get Started",
    author: 'Kyle Simpson',
    condition: 'Good',
    lister: USER_ID_2,
    imageUrl:
      'https://m.media-amazon.com/images/I/41T5H8u7fUL._SY445_SX342_ControlCacheEqualizer_.jpg',
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear old data
    await Book.deleteMany();
    await Request.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    // Insert new books
    await Book.insertMany(books);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    // Clear all data
    await Book.deleteMany();
    await Request.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// This allows us to run from the command line
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  console.log('Please specify --import or --destroy');
  process.exit();
}
