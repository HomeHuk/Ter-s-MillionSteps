import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
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
  Award,
  PlusCircle,
  ArrowDownLeft
} from 'lucide-react';

export default function App() {
  // ตั้งค่าเริ่มต้นให้เป็น 0 เมื่อยังไม่มีข้อมูลในระบบ
  const [currentBalance, setCurrentBalance] = useState(0); 
  const [totalInvested, setTotalInvested] = useState(0); 
  const [inputProfit, setInputProfit] = useState(''); 
  const [actionType, setActionType] = useState('deposit'); // ตั้งค่า Default หน้าฟอร์มให้เริ่มที่ "เติมเงิน"
  const [history, setHistory] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

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
        setTotalInvested(Number(data[0].total_invested || 0));
      } else {
        // เมื่อไม่มีข้อมูลใน DB ให้เซ็ตเป็น 0
        setHistory([]);
        setCurrentBalance(0);
        setTotalInvested(0);
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

  const todayTargetProfit = currentBalance > 0 ? currentBalance * 0.20 : 0;
  const todayRequiredTotal = currentBalance + todayTargetProfit;

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    const amount = parseFloat(inputProfit);
    if (isNaN(amount) || amount <= 0) return;

    let newBalance = currentBalance;
    let newTotalInvested = totalInvested;
    let withdrawable = 0;
    let recordType = 'กำไร';

    if (actionType === 'withdraw') {
      if (amount > currentBalance) {
        alert('ยอดเงินในพอร์ตปัจจุบันมีไม่พอให้ถอนครับ!');
        return;
      }
      recordType = 'ถอนเงิน';
      newBalance = currentBalance - amount;
      newTotalInvested = Math.max(0, totalInvested - amount);
    } else if (actionType === 'deposit') {
      recordType = 'เติมเงินทุน';
      newTotalInvested = totalInvested + amount;
      newBalance = currentBalance + amount;
    } else if (actionType === 'gain') {
      recordType = 'กำไร';
      if (currentBalance > 0) {
        const expectedTotal = currentBalance + todayTargetProfit;
        const actualTotal = currentBalance + amount;

        if (actualTotal > expectedTotal) {
          withdrawable = actualTotal - expectedTotal; 
          newBalance = expectedTotal; 
        } else {
          newBalance = actualTotal;
        }
      } else {
        newBalance = currentBalance + amount;
      }
    } else if (actionType === 'loss') {
      recordType = 'ขาดทุน';
      newBalance = currentBalance - amount; 
    }

    try {
      const { error } = await supabase
        .from('daily_records')
        .insert([{
          type: recordType,
          amount: amount,
          balance_before: currentBalance,
          balance_after: newBalance,
          withdrawable: withdrawable,
          total_invested: newTotalInvested
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
          
          <div className="w-full sm:w-auto flex items-center gap-3">
            <div className="flex-1 sm:flex-none bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">รวมเงินลงทุนทั้งหมด</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span className="text-lg font-black font-mono text-cyan-400">
                  ฿{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex-1 sm:flex-none bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">พอร์ตปัจจุบัน</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className={`text-lg font-black font-mono ${currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  ฿{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
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
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TARGETS.map((target, idx) => {
                const daysLeft = calculateDaysRemaining(currentBalance, target.value);
                const progress = Math.max(0, Math.min(100, (currentBalance / target.value) * 100));

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
                        <span className="text-2xl font-black font-mono text-rose-400">🚨 พอร์ตติดลบ</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                  <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActionType('gain')}
                      className={`py-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-0.5 ${actionType === 'gain' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" /> ปิดบวก
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('loss')}
                      className={`py-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-0.5 ${actionType === 'loss' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" /> ปิดลบ
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('deposit')}
                      className={`py-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-0.5 ${actionType === 'deposit' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <PlusCircle className="w-3.5 h-3.5 stroke-[3]" /> เติมเงิน
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType('withdraw')}
                      className={`py-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-0.5 ${actionType === 'withdraw' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 stroke-[3]" /> ถอนเงิน
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      {actionType === 'withdraw' 
                        ? 'ระบุจำนวนเงินที่ต้องการถอนออก (บาท)' 
                        : actionType === 'deposit' 
                        ? 'ระบุจำนวนเงินที่ต้องการเติมเพิ่ม (บาท)' 
                        : 'ระบุจำนวนเงินจริง (บาท)'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">฿</div>
                      <input
                        type="number"
                        step="any"
                        value={inputProfit}
                        onChange={(e) => setInputProfit(e.target.value)}
                        placeholder={
                          actionType === 'withdraw' 
                            ? "ใส่จำนวนเงินที่ต้องการถอน" 
                            : actionType === 'deposit' 
                            ? "ใส่จำนวนเงินลงทุนที่ต้องการเติม" 
                            : actionType === 'gain' 
                            ? "วันนี้ทำกำไรได้กี่บาท" 
                            : "วันนี้เทรดเสียไปกี่บาท"
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                      actionType === 'withdraw'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-950'
                        : actionType === 'deposit' 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-950' 
                        : actionType === 'gain'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950'
                        : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" /> 
                    {actionType === 'withdraw' ? 'บันทึกรายการถอนเงิน' : actionType === 'deposit' ? 'บันทึกยอดเติมเงินทุน' : 'บันทึกยอดเข้าคลาวด์เซิร์ฟเวอร์'}
                  </button>
                </form>
              </main>

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
                        <strong>ระบบแจ้งเตือนเงินรางวัล:</strong> พอร์ตโตเกินเป้าหมายทบต้น มีเงินส่วนเกินที่ถอนออกไปใช้รางวัลชีวิตได้ <span className="text-white font-black font-mono">฿{Number(history[0].withdrawable).toLocaleString(undefined, {maximumFractionDigits:2})}</span> โดยไม่กระทบโครงสร้างทุนหลัก!
                      </div>
                    </div>
                  )}

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
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black ${
                                  item.type === 'ถอนเงิน'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : item.type === 'เติมเงินทุน'
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : item.type === 'กำไร'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {item.type === 'ถอนเงิน' ? <ArrowDownLeft className="w-3 h-3" /> : item.type === 'เติมเงินทุน' ? <PlusCircle className="w-3 h-3" /> : item.type === 'กำไร' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                  {item.type}
                                </span>
                              </td>
                              <td className={`py-3 text-right font-bold ${
                                item.type === 'ถอนเงิน' ? 'text-amber-400' : item.type === 'เติมเงินทุน' ? 'text-cyan-400' : item.type === 'กำไร' ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {item.type === 'กำไร' || item.type === 'เติมเงินทุน' ? '+' : '-'}฿{Number(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </td>
                              <td className={`py-3 text-right font-bold ${Number(item.balance_after) >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                                ฿{Number(item.balance_after).toLocaleString(undefined, {maximumFractionDigits:2})}
                              </td>
                            </tr>
                          ))}
                          {history.length === 0 && (
                            <tr>
                              <td colSpan="4" className="text-center py-12 text-slate-500 text-xs">เริ่มต้นบันทึกรายการโดยเลือก "เติมเงิน" เป็นครั้งแรกได้เลยครับ!</td>
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
