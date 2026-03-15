import sys
import reinkpy

def main():
    print("--- OPEN WIC EPSON USB RESET ENGINE ---")
    print("[1] Procurando Impressora via USB através do reinkpy...")
    try:
        device = reinkpy.Device.from_usb(manufacturer="EPSON")
        if not device:
            print("❌ Nenhuma EPSON USB encontrada pelo Device.from_usb().")
            sys.exit(1)
            
        print(f"[+] Epson {device.model} encontrada no Barramento USB!")
        
        # Tentar ler o status do pad via protocolo EPSON puro
        print("\n[2] Lendo Memory Bank (Waste Ink Pad Counter)...")
        waste_stats = device.epson.do_status()
        print(f"    Valor Raw da EEPROM: {waste_stats}")
        
        # Forçar Reescrita FÍSICA
        print("\n[3] INICIANDO REESCRITA DA MEMÓRIA PARA 0x00!")
        device.epson.reset_waste()
        print("✅ SUCESSO! Waste Ink Pad resetado para ZERO via pyUSB RAW Protocol!")
        print("⚠️ IMPORTANTE: DESLIGUE A IMPRESSORA NO BOTÃO FÍSICO E LIGUE NOVAMENTE PARA SALVAR NA NVRAM.")
           
    except Exception as e:
        print(f"❌ ERRO detalhado no processo USB: {e}")

if __name__ == "__main__":
    main()
