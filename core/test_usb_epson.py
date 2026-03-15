import usb.core
import usb.util
import sys

# Vendor ID da Epson
EPSON_VENDOR_ID = 0x04b8

def find_epson_printers():
    print(f"Buscando impressoras USB EPSON (Vendor ID: {hex(EPSON_VENDOR_ID)})...")
    # Busca devices
    devices = usb.core.find(find_all=True, idVendor=EPSON_VENDOR_ID)
    
    found = False
    for dev in devices:
        found = True
        try:
            manufacturer = usb.util.get_string(dev, dev.iManufacturer)
            product = usb.util.get_string(dev, dev.iProduct)
            serial = usb.util.get_string(dev, dev.iSerialNumber)
            print(f"----------------------------------------")
            print(f"[+] DISPOSITIVO ENCONTRADO!")
            print(f"    Fabricante: {manufacturer}")
            print(f"    Produto:    {product}")
            print(f"    Serial:     {serial}")
            print(f"    ID:         {hex(dev.idVendor)}:{hex(dev.idProduct)}")
            
            # Testa acesso basic
            try:
                # O macOS gerencia impressoras fortemente, mas testar se a config ta acessível é bom.
                cfg = dev.get_active_configuration()
                print(f"    Status:     ACESSÍVEL (Permissões de leitura ativas!)")
            except Exception as e:
                print(f"    Status:     OCUPADO PELO SISTEMA macOS (Erro: {e})")
                print("    Dica: Se estiver Ocupado, o macOS CUPS Driver 'pegou' a porta. No Windows isso funciona direto.")
        except Exception as e:
             print(f"[+] DISPOSITIVO GENÉRICO EPSON ENCONTRADO ({hex(dev.idVendor)}:{hex(dev.idProduct)})")
             print(f"    Erro ao ler strings detalhadas: {e}")
             
    if not found:
        print("[-] Nenhuma impressora USB da Epson encontrada fisicamente conectada a este Mac.")

if __name__ == "__main__":
    find_epson_printers()
