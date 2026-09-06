// backend/scripts/seedAdmin.js
//
// سكريبت لعمل حساب admin مباشرة في الداتابيز من غير ما تعدي على
// route محمي (/api/auth/register-admin). تقدر تشغّله وقت ما عايزة
// وتغيّر البيانات تحت زي ما تحبي.
//
// طريقة التشغيل من مجلد backend:
//   node scripts/seedAdmin.js
//
// أو ضيفي السكريبت ده في package.json:
//   "seed:admin": "node scripts/seedAdmin.js"
// وشغليه بـ: npm run seed:admin

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

// ✏️ غيّري البيانات دي بالبيانات اللي عايزة الأدمن يتسجل بيها
const ADMIN_DATA = {
  name: "yasmin hosny",
  email: "yasminehosny930@gmail.com",
  password: "Yas@930",
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const existingUser = await User.findOne({ email: ADMIN_DATA.email });

    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log("ℹ️  اليوزر ده أدمن بالفعل:", existingUser.email);
      } else {
        existingUser.role = "admin";
        await existingUser.save();
        console.log("✅ تم ترقية اليوزر لـ admin:", existingUser.email);
      }
    } else {
      const admin = await User.create({
        name: ADMIN_DATA.name,
        email: ADMIN_DATA.email,
        password: ADMIN_DATA.password, // هيتشفّر تلقائي من الـ pre-save hook في الموديل
        role: "admin",
      });
      console.log("✅ تم إنشاء حساب admin جديد:", admin.email);
    }
  } catch (error) {
    console.error("❌ حصل خطأ:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 تم قطع الاتصال بالداتابيز");
    process.exit(0);
  }
};

seedAdmin();