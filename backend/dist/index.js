"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const DB_PATH = './timetable.db';
let db;
function initDb() {
    db = new sqlite3_1.default.Database(DB_PATH, (err) => {
        if (err)
            throw err;
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`);
            db.run(`CREATE TABLE IF NOT EXISTS availabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        day_of_week INTEGER,
        hour INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);
        });
    });
}
// 시간표 제출
app.post('/api/submit', (req, res) => {
    const { name, slots } = req.body; // slots: [{ day: number, hour: number }]
    if (!name || !Array.isArray(slots)) {
        return res.status(400).json({ error: 'Invalid payload' });
    }
    db.get('SELECT * FROM users WHERE name = ?', [name], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'DB error' });
        const saveSlots = (userId) => {
            db.run('DELETE FROM availabilities WHERE user_id = ?', [userId], (err2) => {
                if (err2)
                    return res.status(500).json({ error: 'DB error' });
                const stmt = db.prepare('INSERT INTO availabilities (user_id, day_of_week, hour) VALUES (?, ?, ?)');
                for (const slot of slots) {
                    stmt.run(userId, slot.day, slot.hour);
                }
                stmt.finalize(() => {
                    res.json({ success: true });
                });
            });
        };
        if (!user) {
            db.run('INSERT INTO users (name) VALUES (?)', [name], function (err2) {
                if (err2)
                    return res.status(500).json({ error: 'DB error' });
                db.get('SELECT * FROM users WHERE name = ?', [name], (err3, user2) => {
                    if (err3 || !user2)
                        return res.status(500).json({ error: 'DB error' });
                    saveSlots(user2.id);
                });
            });
        }
        else {
            saveSlots(user.id);
        }
    });
});
// 시간대별 가능한 사람 목록 조회
app.get('/api/availability', (req, res) => {
    const day = parseInt(req.query.day);
    const hour = parseInt(req.query.hour);
    if (isNaN(day) || isNaN(hour)) {
        return res.status(400).json({ error: 'Invalid query' });
    }
    db.all(`SELECT u.name FROM availabilities a JOIN users u ON a.user_id = u.id WHERE a.day_of_week = ? AND a.hour = ?`, [day, hour], (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'DB error' });
        res.json({ names: rows.map((r) => r.name) });
    });
});
// 전체 시간표별 인원 목록
app.get('/api/all-availability', (req, res) => {
    db.all(`SELECT a.day_of_week, a.hour, u.name FROM availabilities a JOIN users u ON a.user_id = u.id`, (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'DB error' });
        res.json({ slots: rows });
    });
});
// 모든 데이터 초기화
app.post('/api/reset-all', (req, res) => {
    db.serialize(() => {
        db.run('DELETE FROM availabilities', [], (err) => {
            if (err)
                return res.status(500).json({ error: 'Failed to reset availabilities' });
            res.json({ success: true });
        });
    });
});
// --- 정적 파일 서빙 (프론트엔드 빌드) ---
const FRONTEND_DIST = path_1.default.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(FRONTEND_DIST));
// SPA fallback: API 이외 모든 요청은 index.html 반환
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path_1.default.join(FRONTEND_DIST, 'index.html'));
});
initDb();
app.listen(3001, () => {
    console.log('Backend listening on http://localhost:3001');
});
