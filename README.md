# Open WIC 🖨️🔓
**Right to Repair - A Free & Open Source Waste Ink Resetter**

O **Open WIC** é uma ferramenta de código aberto contruída em **React (Vite) + Electron** com um robustro backend API em **Python e SNMP**, criado para garantir o **Direito ao Reparo**. 

Não pague por *Reset Keys*. Resete sua impressora bloqueada gratuitamente, do conforto de uma interface premium e moderna (Glassmorphism).

## 🚀 Como Executar em Desenvolvimento

Este projeto é uma ponte entre Frontend (Interface UI) e Backend (Varredura de Rede via Python). Siga as etapas abaixo para ligar os dois motores:

### 1. Iniciar o Backend API (Python)
Este servidor rastreia as impressoras via protocolo SNMP, PJL e PyUSB RAW.
**ATENÇÃO:** No Mac e Linux, para conseguir ler fisicamente e resetar via cabo USB, você precisa rodar o servidor como ROOT (`sudo`).
```bash
cd core
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
sudo uvicorn server:app --host 0.0.0.0 --port 8000
```

### 2. Iniciar a Interface Premium (Node/React)
Em um novo terminal, suba o Painel de Controle e veja a mágica acontecer:
```bash
cd interface
npm install --legacy-peer-deps
npm run dev
```
*(Uma nova janela do aplicativo de Desktop será aberta).*

---

## 📦 Como Compilar e Empacotar (Para o Usuário Final)
Se você apenas quiser gerar o `.dmg` (Mac) ou `.exe` (Windows) para enviar aos amigos:
```bash
cd interface
npm run package
```
> O seu aplicativo nativo instalável estará aguardando dentro da pasta `/interface/release/`.

## 🛡️ Disclaimer de Hardware
Este software envia pacotes HEX diretamente para a Memória EEPROM (Electrical Erasable Programmable Read-Only Memory) da sua impressora. Não nos responsabilizamos por malwares de rede local ou derramamento físico de tinta real da impressora caso você resete o contador e não limpe as almofadas físicas de resíduo.

---

## ☕ Ajude a Manter o Software Livre (Donations)

A Obsolescência Programada enche o bolso das grandes corporações, mas a nossa missão é empoderar o consumidor! Esta ferramenta nasceu gratuita e sempre será.

Se o **Open WIC** salvou sua impressora da lixeira ou te poupou os $10 dólares de uma chave WIC descartável, considere me pagar um café para continuarmos expandindo os modelos suportados:

*   **Paga um Café no PIX:** (Coloque sua chave PIX aqui)
*   **Deixe uma ⭐️ Estrela no GitHub:** Isso ajuda o projeto a alcançar mais pessoas!

> *"Nós somos a Resistência."* 🖨️✊
