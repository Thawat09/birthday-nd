# Happy Birthday Endu 🎂

เว็บอวยพรวันเกิดสำหรับ **Natchaya (Endu)** — 16 สิงหาคม 2535

## ฟีเจอร์

- Animation เปิดของขวัญ + confetti
- นับถอยหลังถึงวันเกิด / แสดงอายุ
- **จิ้มลูกโป่ง** — เกมแตะลูกโป่งให้แตก
- **เป่าเทียน** — กดค้างบนเทียนเพื่อเป่า
- **ขูดการ์ด** — เปิดข้อความลับ
- **เก็บหัวใจ** — แตะหัวใจที่ลอยขึ้นมา
- **ฟอร์มอวยพร** — เก็บใน localStorage
- Easter egg — แตะหัวใจ 5 ครั้งที่ footer
- รองรับมือถือหลายขนาด (responsive)

## เปิดดูในเครื่อง

```bash
# วิธีง่าย — ใช้ Python
cd Birthday
python -m http.server 8080
# เปิด http://localhost:8080
```

หรือเปิดไฟล์ `index.html` ตรง ๆ ในเบราว์เซอร์

## Deploy บน AWS (S3 + CloudFront)

### 1. สร้าง S3 Bucket

```bash
aws s3 mb s3://happy-birthday-endu --region ap-southeast-1
```

### 2. อัปโหลดไฟล์

```bash
aws s3 sync . s3://happy-birthday-endu --exclude ".git/*" --exclude "README.md"
```

### 3. เปิด Static Website Hosting

- S3 Console → Bucket → Properties → Static website hosting → Enable
- Index document: `index.html`

### 4. (แนะนำ) ใช้ CloudFront

- สร้าง distribution ชี้ไป S3 bucket
- ใส่ HTTPS + custom domain ได้

### 5. Bucket Policy (public read)

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::happy-birthday-endu/*"
  }]
}
```

## ข้อมูลเก็บไว้ที่ไหน?

| วิธี | เหมาะกับ | ข้อดี | ข้อจำกัด |
|------|----------|-------|----------|
| **localStorage** (ใช้อยู่ตอนนี้) | ของขวัญส่วนตัว | ไม่ต้องมี server, ฟรี | เห็นเฉพาะเบราว์เซอร์/เครื่องนั้น |
| **AWS Lambda + DynamoDB** | อยากให้ทุกคนเห็นคำอวยพรร่วมกัน | เก็บถาวร, แชร์ได้ | ต้อง setup API |
| **AWS Amplify** | อยาก deploy + backend ง่าย | CI/CD ในตัว | มีค่าใช้จ่ายเมื่อใช้เยอะ |

### ถ้าอยาก upgrade เป็น DynamoDB ภายหลัง

1. สร้าง DynamoDB table `birthday-wishes`
2. สร้าง Lambda function รับ POST/GET
3. ใช้ API Gateway เป็น REST endpoint
4. แก้ `js/main.js` ให้ fetch แทน localStorage

## ปรับแต่ง

- **ดนตรี**: ทำในตัวด้วย Web Audio — ทำนอง Happy Birthday ไม่มีเสียงร้อง เล่นอัตโนมัติเมื่อเปิดของขวัญ ครั้งเดียวแล้วจบ
- **รูปภาพ**: เพิ่ม section ใน `index.html` และใส่รูปในโฟลเดอร์ `assets/`
- **ข้อความ**: แก้ใน `index.html` และ `js/main.js` (ตัวแปร `BIRTH_DATE`)

## โครงสร้าง

```
Birthday/
├── index.html
├── css/style.css
├── js/
│   ├── confetti.js
│   └── main.js
└── README.md
```
