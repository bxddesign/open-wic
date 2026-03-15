import asyncio
import sys
from pysnmp.hlapi.asyncio import *

async def fetch_snmp(ip: str, oid: str):
    snmp_engine = SnmpEngine()
    try:
        errorIndication, errorStatus, errorIndex, varBinds = await getCmd(
            snmp_engine,
            CommunityData('public', mpModel=0),
            UdpTransportTarget((ip, 161), timeout=2.0, retries=1),
            ContextData(),
            ObjectType(ObjectIdentity(oid))
        )
        if errorIndication or errorStatus:
            return None
        return varBinds[0][1].prettyPrint()
    except Exception as e:
        return None

async def main():
    ips = ['192.168.100.7', '192.168.100.8', '192.168.100.1', '192.168.100.5', '192.168.100.9', '192.168.100.10']
    OID_MODEL = '1.3.6.1.2.1.25.3.2.1.3.1'
    OID_STATUS = '1.3.6.1.2.1.25.3.5.1.1.1'
    
    print("Iniciando varredura SNMP Assíncrona...")
    for ip in ips:
        model = await fetch_snmp(ip, OID_MODEL)
        if model:
            print(f"[+] SUCESSO! Epson encontrada em {ip}")
            print(f"    Modelo: {model}")
            status = await fetch_snmp(ip, OID_STATUS)
            print(f"    Status Bruto: {status}")
            print("-------------------------------------------------")
        else:
            print(f"[-] {ip} - Timeout ou Não é Impressora.")

if __name__ == "__main__":
    asyncio.run(main())
