import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
// นำเข้าไอคอนสายการเงินและนักธุรกิจระดับพรีเมียม
import { 
  TrendingUp, 
  Wallet, 
  Target, 
  Briefcase, 
  UserCheck, 
  CircleDollarSign, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  Coins,
  Gem,
  Award
} from 'lucide-react';

export default function App() {
  const [currentBalance, setCurrentBalance] = useState(1000); 
  const [inputProfit, setInputProfit] = useState(''); 
  const [isGain, setIsGain] = useState(true); 
  const [history, setHistory] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  // ปรับการ์ดเป้าหมายให้มีไอคอนระบุความสำเร็จระดับนักธุรกิจชั้นนำ
  const TARGETS = [
    { label: '🔥 1 ล้านบาทแรก (First Goal)', value: 1000000, color: 'from-cyan-500/10 via-emerald-500/20 to-slate-900', borderColor: 'border-emerald-500/30', icon: <Coins className="w-6 h-6 text-emerald-400" /> },
    { label: '👑 5 ล้านบาท (Elite Trader)', value: 5000000, color: 'from-blue-600/10 via-indigo-500/20 to-slate-900', borderColor: 'border-indigo-500/30', icon: <Briefcase className="w-6 h-6 text-indigo-400" /> },
    { label: '💎 10 ล้านบาท (Freedom Investor)', value: 10000000, color: 'from-purple-600/10 via-pink-500/20 to-slate-900', borderColor: 'border-pink-500/30', icon: <Gem className="w-6 h-6 text-pink-400" /> }
  ];

  useEffect(() => {
    fetchDailyRecords();
  }, []);

  const fetchDailyRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_records')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setHistory(data);
        setCurrentBalance(Number(data[0].balance_after));
      } else {
        setCurrentBalance(1000);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysRemaining = (current, target) => {
    if (current >= target) return 0;
    if (current <= 0) return '∞';
    const dailyRate = 0.20; 
    const days = Math.log(target / current) / Math.log(1 + dailyRate);
    return Math.ceil(days);
  };

  const todayTargetProfit = currentBalance * 0.20;
  const todayRequiredTotal = currentBalance * 1.20;

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    const amount = parseFloat(inputProfit);
    if (isNaN(amount) || amount <= 0) return;

    let newBalance = currentBalance;
    let withdrawable = 0;

    if (isGain) {
      const expectedTotal = currentBalance + todayTargetProfit;
      const actualTotal = currentBalance + amount;

      if (actualTotal > expectedTotal) {
        withdrawable = actualTotal - expectedTotal; 
        newBalance = expectedTotal; 
      } else {
        newBalance = actualTotal;
      }
    } else {
      newBalance = Math.max(0, currentBalance - amount); 
    }

    try {
      const { error } = await supabase
        .from('daily_records')
        .insert([{
          type: isGain ? 'กำไร' : 'ขาดทุน',
          amount: amount,
          balance_before: currentBalance,
          balance_after: newBalance,
          withdrawable: withdrawable
        }]);

      if (error) throw error;

      setInputProfit('');
      fetchDailyRecords();

    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 lg:p-8 font-sans antialiased selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- Header & Top Profile --- */}
        <header className="relative overflow-hidden bg-slate-900/80 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/20 text-slate-950">
              <UserCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-100 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Ter's MillionSteps
                </h1>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 font-medium text-emerald-400">PRO PLAN</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">ระบบวิเคราะห์และคำนวณพอร์ตทบต้น 20% รายวัน</p>
            </div>
          </div>
          
          <div className="w-full sm:w-auto bg-slate-950/60 px-4 py-3 rounded-xl border border-slate-800/80 flex justify-between sm:block items-center">
            <span className="text-[11px] text-slate-400 font-medium tracking-wider uppercase block sm:mb-0.5">พอร์ตปัจจุบัน</span>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400 hidden sm:inline" />
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ฿{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-slate-900/30 rounded-2xl border border-slate-800/40">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm animate-pulse">กำลังซิงค์ฐานข้อมูลคลาวด์...</p>
          </div>
        ) : (
          <>
            {/* --- โซนการ์ดเป้าหมายเชิงลึก (3 Columns) --- */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TARGETS.map((target, idx) => {
                const daysLeft = calculateDaysRemaining(currentBalance, target.value);
                const progress = Math.min(100, (currentBalance / target.value) * 100);

                return (
                  <div key={idx} className={`bg-gradient-to-b ${target.color} p-5 rounded-2xl border ${target.borderColor} shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.01]`}>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-300 tracking-wide block">{target.label}</span>
                      <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-800">
                        {target.icon}
                      </div>
                    </div>
                    
                    <div className="mt-4 mb-2 flex items-baseline gap-1">
                      {typeof daysLeft === 'number' ? (
                        daysLeft > 0 ? (
                          <>
                            <span className="text-3xl font-black font-mono text-white">อีก {daysLeft}</span>
                            <span className="text-sm font-bold text-slate-400">วัน</span>
                          </>
                        ) : (
                          <span className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                            <Award className="w-6 h-6 text-yellow-400" /> Complete!
                          </span>
                        )
                      ) : (
                        <span className="text-3xl font-black font-mono text-rose-400">🚨 พอร์ตติดลบ</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                      <span>เป้าหมาย: ฿{target.value.toLocaleString()}</span>
                      <span className="text-emerald-400 font-bold">{progress.toFixed(2)}%</span>
                    </div>

                    <div className="w-full bg-slate-950 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* --- โซนทำงานหลักแบ่งเลย์เอาต์ตามจอมือถือและคอมพิวเตอร์ --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ฝั่งซอร์มบันทึกข้อมูล (4 ส่วนในจอใหญ่, เต็มจอในมือถือ) */}
              <main className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-black text-slate-200">อัปเดตสถานะพอร์ตรายวัน</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/60 font-mono text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 flex items-center gap-1"><Percent className="w-3 h-3" /> เป้ากำไร (20%)</span>
                    <span className="text-emerald-400 font-bold text-sm block">+฿{todayTargetProfit.toFixed(2)}</span>
                  </div>
                  <div className="space-y-0.5 border-l border-slate-800 pl-3">
                    <span className="text-slate-400 flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> ยอดปิดพอร์ตวันนี้</span>
                    <span className="text-cyan-400 font-bold text-sm block">฿{todayRequiredTotal.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleUpdateBalance} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsGain(true)}
                      className={`py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${isGain ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[3]" /> ปิดบวกกำไร
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGain(false)}
                      className={`py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${!isGain ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <ArrowDownRight className="w-4 h-4 stroke-[3]" /> ปิดลบขาดทุน
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">ระบุจำนวนเงินจริง (บาท)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">฿</div>
                      <input
                        type="number"
                        step="any"
                        value={inputProfit}
                        onChange={(e) => setInputProfit(e.target.value)}
                        placeholder={isGain ? "วันนี้ทำกำไรได้กี่บาท" : "วันนี้เทรดเสียไปกี่บาท"}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide text-white transition-all shadow-lg flex items-center justify-center gap-2 ${isGain ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950' : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950'}`}
                  >
                    <TrendingUp className="w-4 h-4" /> บันทึกยอดเข้าคลาวด์เซิร์ฟเวอร์
                  </button>
                </form>
              </main>

              {/* ฝั่งตารางสถิติและประวัติ (7 ส่วนในจอใหญ่, เลื่อนสไลด์ด้านข้างได้ในมือถือจอเล็กเพื่อไม่ให้ตารางพัง) */}
              <section className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                    <History className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-black text-slate-200">ประวัติธุรกรรมและกระเป๋าเงินถอนได้</h2>
                  </div>
                  
                  {history.length > 0 && Number(history[0].withdrawable) > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-950 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs sm:text-sm flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 animate-bounce">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <strong>ระบบแจ้งเตือนเงินรางวัล:</strong> พอร์ตโตเกินเป้าหมายทบต้น มีเงินส่วนเกินที่ถอนออกไปใช้รางวัลชีวิตได้ <span className="text-white font-black font-mono">฿{Number(history[0].withdrawable).toLocaleString(undefined, {maximumFractionDigits:2})}</span> โดยไม่กระทบโครงสร้างทุนหลักครับคุณเตอร์!
                      </div>
                    </div>
                  )}

                  {/* รองรับ Responsive Table บนจอมือถือไม่ให้หลุดขอบ */}
                  <div className="overflow-x-auto -mx-5 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-5 sm:px-0">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-800/60 font-semibold">
                            <th className="pb-2.5">วันที่บันทึก</th>
                            <th className="pb-2.5">ประเภท</th>
                            <th className="pb-2.5 text-right">จำนวนยอดวัน</th>
                            <th className="pb-2.5 text-right">มูลค่าพอร์ตสุทธิ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 font-mono text-slate-300">
                          {history.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="py-3 text-slate-400 text-xs">{new Date(item.created_at).toLocaleDateString('th-TH', {day: '2-digit', month: 'short'})}</td>
                              <td className="py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black ${item.type === 'กำไร' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                  {item.type === 'กำไร' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                  {item.type}
                                </span>
                              </td>
                              <td className={`py-3 text-right font-bold ${item.type === 'กำไร' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.type === 'กำไร' ? '+' : '-'}฿{Number(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </td>
                              <td className="py-3 text-right text-cyan-400 font-bold">฿{Number(item.balance_after).toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                            </tr>
                          ))}
                          {history.length === 0 && (
                            <tr>
                              <td colSpan="4" className="text-center py-12 text-slate-500 text-xs">ยินดีต้อนรับสู่ระบบเศรษฐีทบต้น เริ่มต้นบันทึกยอดเงินวันแรกได้เลยครับคุณเตอร์!</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
