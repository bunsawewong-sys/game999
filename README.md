# Firewall Defender

เกมยิงยานอวกาศแนวตั้ง (Vertical Shooter) ภาพ Pixel Art ธีม Network / Cyber
ผู้เล่นเป็น Firewall ยิงกำจัด Spam Packet, ICMP Ping, Worm, Trojan, Virus
และ Boss ทุก 3 Wave (DDoS Core, Ransomware, Botnet C&C) เล่นบน browser มือถือได้ทันที

Requirement ฉบับเต็มอยู่ที่ [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)

## วิธีเล่น

- ลากนิ้วที่ตรงไหนก็ได้บนจอ ยานจะขยับตามระยะที่ลาก (นิ้วไม่บังยาน)
- ยานยิงเองอัตโนมัติ
- เก็บกล่อง Power-up ที่ศัตรูทำหล่น
- จบแต่ละ Wave เลือกการ์ดอัปเกรด 1 ใบจาก 3 ใบ
- บนคอมพิวเตอร์ใช้ลูกศร / WASD และกด ESC หรือ P เพื่อหยุดเกม

## โครงสร้างโปรเจกต์

| ส่วน | ไฟล์ |
|---|---|
| ตัวเกม (Phaser 3) | `src/` |
| หน้าจอต่างๆ (เมนู, เกม, HUD, อัปเกรด, Game Over, Leaderboard) | `src/scenes/` |
| ภาพ Pixel Art ทั้งหมด (วาดด้วยโค้ด) | `src/art/sprites.js` |
| เสียงและเพลง (สร้างด้วย Web Audio) | `src/audio/` |
| ข้อความไทย / อังกฤษ | `src/i18n.js` |
| ค่าความยาก, HP, ความเร็ว | `src/config.js` |
| API Leaderboard (Vercel Function) | `api/scores.js` |

## การเชื่อม Leaderboard ออนไลน์ (Upstash Redis)

ถ้ายังไม่เชื่อม เกมจะเก็บ Leaderboard ไว้ในเครื่องผู้เล่นแทน (เล่นได้ปกติ)

1. เข้า [Vercel Dashboard](https://vercel.com/dashboard) แล้วเปิด project **game999**
2. ไปที่แท็บ **Storage** แล้วกด **Create Database** (หรือ **Connect Database**)
3. เลือก **Upstash** แล้วเลือก **Redis** จากนั้นเลือก plan **Free**
4. เลือก Region ที่ใกล้ไทย (เช่น Singapore) แล้วกด **Create**
5. ตอนถามว่าจะต่อกับ project ไหน ให้เลือก **game999** และติ๊กทั้ง Production, Preview, Development
6. ไปแท็บ **Deployments** กดปุ่ม `...` ที่ deployment ล่าสุดแล้วเลือก **Redeploy**
   (ค่าเชื่อมต่อ Database จะมีผลหลัง deploy ใหม่)

เช็คว่าใช้งานได้: เปิดหน้า Leaderboard ในเกม ถ้าขึ้นคำว่า "ออนไลน์" แปลว่าเชื่อมสำเร็จ

API อ่านค่าเชื่อมต่อจาก environment variables `KV_REST_API_URL` + `KV_REST_API_TOKEN`
(ชื่อที่ Vercel ใส่ให้อัตโนมัติ) หรือ `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

## สำหรับนักพัฒนา

```bash
npm install
npm run dev      # เปิดเกมที่ http://localhost:5173 (Leaderboard จะเป็นแบบในเครื่อง)
npm test         # ทดสอบ API และการตรวจชื่อ/คะแนน
npm run build    # build ไฟล์สำหรับ deploy ไว้ที่ dist/
```

เปิดด้วย `?debug=1` ต่อท้าย URL จะมีตัวแปร `window.__fd` (Phaser game instance) ไว้ดีบัก
