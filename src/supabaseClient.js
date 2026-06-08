import { createClient } from '@supabase/supabase-js';

// ดึงค่า URL และ API Key มาจากไฟล์ .env ที่เราจะสร้างไว้ด้านนอก
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// สร้างตัวแปรหลักสำหรับส่งไปใช้งานในหน้าอื่นๆ เช่น App.jsx
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 