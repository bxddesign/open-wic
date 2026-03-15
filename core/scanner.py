import sys
from pysnmp.hlapi import *

def snmp_get(ip, oid):
    errorIndication, errorStatus, errorIndex, varBinds = next(
        getCmd(SnmpEngine(),
               CommunityData('public', mpModel=0),
               UdpTransportTarget((ip, 161), timeout=2, retries=1),
               ContextData(),
               ObjectType(ObjectIdentity(oid)))
    )

    if errorIndication:
        print(f"Erro SNMP: {errorIndication}")
        return None
    elif errorStatus:
        print(f"Erro Status: {errorStatus.prettyPrint()}")
        return None
    else:
        for varBind in varBinds:
            return varBind[1].prettyPrint()

def get_printer_info(ip):
    # OIDs comuns da Epson para status
    PRINTER_MODEL_OID = '1.3.6.1.2.1.25.3.2.1.3.1'
    PRINTER_STATUS_OID = '1.3.6.1.2.1.25.3.5.1.1.1'
    
    print(f"🔍 Conectando à impressora no IP: {ip}...")
    
    model = snmp_get(ip, PRINTER_MODEL_OID)
    if model:
        print(f"🖨️ Modelo: {model}")
    else:
        print("❌ Não foi possível ler o modelo da impressora.")
        return

    status = snmp_get(ip, PRINTER_STATUS_OID)
    print(f"📊 Status Bruto SNMP: {status}")
    
    # Exemplo: Lendo níveis de tinta genéricos (Pode variar por modelo)
    # A leitura da EEPROM (Painel de Resíduos) na Epson geralmente usa OIDs proprietários ou SNMP Set.
    print("⚠️  Aviso: OIDs para reset de Waste Ink variam por modelo. Este é um scanner básico.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python scanner.py <IP_DA_IMPRESSORA>")
        sys.exit(1)
        
    printer_ip = sys.argv[1]
    get_printer_info(printer_ip)
