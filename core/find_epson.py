import socket
import struct
import ifaddr
from scapy.all import ARP, Ether, srp
import sys

# Função para pegar IPs locais do Mac
def get_local_interfaces():
    adapters = ifaddr.get_adapters()
    subnets = []
    for addr in adapters:
        for ip in addr.ips:
            if isinstance(ip.ip, str) and ip.ip != "127.0.0.1":
                # Assumindo subnet /24 padrao para rede domestica
                subnet = ip.ip.rsplit('.', 1)[0] + '.0/24'
                subnets.append(subnet)
    return list(set(subnets))

# Função para fazer Sweep na rede via ARP e buscar as impressoras OUI (Epson/Seiko)
def scan_printers(ip_range):
    print(f"[*] Varrendo a rede ARP em: {ip_range}")
    
    # Lista de MACs (OUI) conhecidos da Seiko Epson Corp
    epson_ouis = ['00:00:48', '00:26:ab', '00:14:38', 'f8:d0:27', 'a4:ee:57', 'c8:1f:66', 'cc:db:93', 'd8:d3:85', '00:0e:58', '64:eb:8c']

    # Scapy magento ARP request broadcast
    arp_pkt = Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst=ip_range)
    ans, unans = srp(arp_pkt, timeout=2, verbose=False)

    found_printers = []
    
    for snd, rcv in ans:
        mac = rcv.hwsrc
        ip = rcv.psrc
        
        # Pega as 3 primeiras tuplas do MAC (OUI)
        mac_oui = mac[:8].lower()
        
        # O fabricante as vezes nao e Epson ou ta mascarado. Ideal é ver pelo Bonjour/SNMP,
        # Mas via MAC é mais rápido. 
        if mac_oui in epson_ouis:
             print(f"[+] EPSON Encontrada via ARP: {ip} - MAC: {mac}")
             found_printers.append(ip)
        else:
            # Se nao for Epson pelo MAC, podemos tentar abrir socket na 161 para testar
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.settimeout(0.1)
                s.connect((ip, 161)) # Tenta snmp port
                found_printers.append(ip)
                s.close()
            except:
                pass
                
    return list(set(found_printers))

if __name__ == "__main__":
    print(f"--- OPEN WIC SCANNER LOCAL EPSON MAC OUI ---")
    subnets = get_local_interfaces()
    all_ips = []
    for subnet in subnets:
        all_ips.extend(scan_printers(subnet))
    
    if len(all_ips) == 0:
        print("[-] Nenhuma impressora encontrada (Epson OUI ou porta 161) na sua rede Wi-Fi.")
        sys.exit(1)
        
    print(f"[+] Total IPs Candidatos a Impressoras na Rede: {all_ips}")
    print("Use esses IPs para testar o RESET agora no Open WIC!")
