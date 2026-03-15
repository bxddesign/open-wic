import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCw, Printer, Search, AlertTriangle, Info, TerminalSquare, AlertCircle } from 'lucide-react';

interface PrinterInfo {
  ip: string;
  model: string;
  status: string;
  wasteScore: number; // 0 to 100
}

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterInfo | null>(null);
  const [resetStatus, setResetStatus] = useState<'idle' | 'resetting' | 'success' | 'error'>('idle');

  // Buscando scan na rede real via backend Python (Porta 8000)
  const handleScan = async () => {
    setIsScanning(true);
    setPrinters([]);
    setSelectedPrinter(null);
    setResetStatus('idle');
    
    try {
      const response = await fetch('http://localhost:8000/scan');
      if (!response.ok) throw new Error('API server down');
      const data = await response.json();
      setPrinters(data.printers);
    } catch (error) {
      console.error(error);
      // Fallback embutido se backend falhar (apenas UI safety net)
      setPrinters([{ ip: 'Error: Connection Refused', model: 'Backend Incessível', status: 'Offline', wasteScore: 0 }]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = async (printer: PrinterInfo) => {
    setResetStatus('resetting');
    try {
      const response = await fetch(`http://localhost:8000/reset?printer_ip=${printer.ip}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Falha no Reset');
      await response.json();
      
      setResetStatus('success');
      setSelectedPrinter({ ...printer, wasteScore: 0, status: 'Online - Pronta (Resetado)' });
    } catch (error) {
      console.error(error);
      setResetStatus('error');
    }
  };

  return (
    <div className="min-h-screen p-8 text-slate-100 flex flex-col items-center">
      
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl flex items-center justify-between mb-12 glass-panel rounded-2xl p-6"
      >
        <div className="flex items-center gap-4">
          <div className="bg-brand-500/20 p-3 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Open WIC</h1>
            <p className="text-slate-400 text-sm">Right to Repair - Free Waste Ink Resetter</p>
          </div>
        </div>
        
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          {isScanning ? 'Scanning Network...' : 'Find Printers'}
        </button>
      </motion.header>

      {/* Main Content */}
      <main className="w-full max-w-4xl grid md:grid-cols-12 gap-6">
        
        {/* Printer List */}
        <div className="md:col-span-5 flex flex-col gap-4">
            <h2 className="text-lg font-medium text-slate-300 px-2 flex items-center gap-2">
                <Printer className="w-5 h-5" /> Discovered Devices
            </h2>
            
            <AnimatePresence>
                {printers.length === 0 && !isScanning && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="glass-card p-8 text-center text-slate-400"
                    >
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No printers found.</p>
                        <p className="text-sm">Click "Find Printers" to scan your local network.</p>
                    </motion.div>
                )}
                
                {printers.map((printer, idx) => (
                    <motion.div
                        key={printer.ip}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedPrinter(printer)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                            selectedPrinter?.ip === printer.ip 
                            ? 'bg-slate-800/80 border-brand-500/50 shadow-lg shadow-brand-500/10' 
                            : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg text-white">{printer.model}</h3>
                            {printer.wasteScore > 90 && <AlertTriangle className="w-5 h-5 text-red-400" />}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                            <span className="bg-slate-900/50 px-2 py-1 rounded text-xs font-mono">{printer.ip}</span>
                        </div>
                        
                        {/* Progress Bar Mini */}
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-1.5 rounded-full ${
                                    printer.wasteScore > 80 ? 'bg-red-500' : printer.wasteScore > 50 ? 'bg-yellow-500' : 'bg-brand-500'
                                }`}
                                style={{ width: `${printer.wasteScore}%` }}
                            ></div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Printer Details & Action Dashboard */}
        <div className="md:col-span-7">
            {selectedPrinter ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card overflow-hidden flex flex-col h-full"
                >
                    <div className="p-8 border-b border-slate-700/50 bg-slate-800/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{selectedPrinter.model}</h2>
                                <p className="text-slate-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-brand-500"></span> 
                                    {selectedPrinter.status}
                                </p>
                            </div>
                            <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-mono text-slate-300">
                                IP: {selectedPrinter.ip}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-center">
                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-slate-300 font-medium">Waste Ink Pad Counter (EEPROM)</span>
                                <span className={`text-2xl font-bold ${
                                    selectedPrinter.wasteScore > 80 ? 'text-red-400' : 'text-brand-400'
                                }`}>
                                    {selectedPrinter.wasteScore}%
                                </span>
                            </div>
                            
                            <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-slate-800">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedPrinter.wasteScore}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full relative overflow-hidden ${
                                        selectedPrinter.wasteScore > 80 ? 'bg-red-500' : 
                                        selectedPrinter.wasteScore > 50 ? 'bg-yellow-500' : 'bg-brand-500'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-100%] border-r border-white/40"></div>
                                </motion.div>
                            </div>
                            
                            {selectedPrinter.wasteScore > 80 && (
                                <p className="text-red-400/80 mt-3 text-sm flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    Warning: The printer’s internal waste ink counter is nearly full. The printer will soon refuse to print until this is reset.
                                </p>
                            )}
                        </div>

                        {/* Telemetry / Console View */}
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-sm mb-8 h-32 overflow-y-auto text-slate-500">
                            <div className="flex items-center gap-2 mb-2 text-slate-600 border-b border-slate-800 pb-2">
                                <TerminalSquare className="w-4 h-4" /> SNMP Connection Log
                            </div>
                            <div className="text-green-500/70">{'>'} Connecting to {selectedPrinter.ip}:161...</div>
                            <div className="text-green-500/70">{'>'} Authenticated community: public</div>
                            <div className="text-green-500/70">{'>'} Reading OID 1.3.6.1.2.1.25.3.2.1.3.1 (Model)</div>
                            <div>{'>'} Found EEPROM pointer at 0x4B3A...</div>
                            {resetStatus === 'resetting' && (
                                <div className="text-yellow-500/70 animate-pulse">{'>'} Sending Reset Packet (SNMP SET)...</div>
                            )}
                            {resetStatus === 'success' && (
                                <div className="text-brand-400">{'>'} SUCCESS: Counter overwritten to 0x00. Please restart printer.</div>
                            )}
                        </div>

                        <button 
                            onClick={() => handleReset(selectedPrinter)}
                            disabled={resetStatus === 'resetting' || selectedPrinter.wasteScore === 0}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                                resetStatus === 'success' || selectedPrinter.wasteScore === 0
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/20 border border-red-400/30'
                            }`}
                        >
                            {resetStatus === 'resetting' ? (
                                <>
                                    <RefreshCw className="w-6 h-6 animate-spin" />
                                    Modifying EEPROM...
                                </>
                            ) : resetStatus === 'success' || selectedPrinter.wasteScore === 0 ? (
                                <>
                                    <ShieldCheck className="w-6 h-6 text-brand-500" />
                                    Counter Clean
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                                    Reset Waste Ink Counters
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="h-full flex items-center justify-center glass-card p-12 text-slate-500 border-dashed">
                    <div className="text-center">
                        <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium mb-2 text-slate-400">Select a Printer</h3>
                        <p>Pick a device from the list to view its telemetry and perform maintenance tasks.</p>
                    </div>
                </div>
            )}
        </div>
      </main>

    </div>
  )
}

export default App
