const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new Database("collegeconnect.db");

// ===============================
// TABLES
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    year TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    course TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    course_code TEXT,
    percentage INTEGER
);

CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    course_code TEXT,
    marks INTEGER
);

CREATE TABLE IF NOT EXISTS fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    amount REAL,
    status TEXT,
    payment_date TEXT
);
`);

// ===============================
// DEFAULT ADMIN
// ===============================

const admin = db
    .prepare("SELECT * FROM users WHERE user_id = ?")
    .get("ADM001");

if (!admin) {
    db.prepare(`
        INSERT INTO users
        (user_id, password, role)
        VALUES (?, ?, ?)
    `).run(
        "ADM001",
        "Admin@123",
        "admin"
    );
}

// ===============================
// LOGIN
// ===============================

app.post("/api/login", (req, res) => {

    const { user_id, password } = req.body;

    if (!user_id || !password) {
        return res.status(400).json({
            message: "User ID and password required"
        });
    }

    const user = db
        .prepare(`
            SELECT id, user_id, role
            FROM users
            WHERE user_id = ?
            AND password = ?
        `)
        .get(user_id, password);

    if (!user) {
        return res.status(401).json({
            message: "Invalid ID or password"
        });
    }

    res.json({
        message: "Login successful",
        user: user
    });
});

// ===============================
// REGISTER
// ===============================

app.post("/api/register", (req, res) => {

    const {
        user_id,
        password,
        role
    } = req.body;

    if (!user_id || !password || !role) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const normalizedRole = String(role).toLowerCase();

    // Admin cannot be self-created
    if (normalizedRole === "admin") {
        return res.status(403).json({
            message: "Admin account cannot be self-created"
        });
    }

    try {

        db.prepare(`
            INSERT INTO users
            (user_id, password, role)
            VALUES (?, ?, ?)
        `).run(
            user_id,
            password,
            normalizedRole
        );

        res.json({
            message: "Account created successfully"
        });

    } catch (error) {

        res.status(400).json({
            message: "User ID already exists"
        });

    }
});

// ===============================
// GET ALL STUDENTS
// ===============================

app.get("/api/students", (req, res) => {

    const students = db
        .prepare(`
            SELECT
                student_id AS id,
                student_id,
                name,
                department,
                year,
                email
            FROM students
            ORDER BY student_id
        `)
        .all();

    res.json(students);
});

// ===============================
// ADD STUDENT
// ===============================

app.post("/api/students", (req, res) => {

    const {
        student_id,
        name,
        department,
        year,
        email
    } = req.body;

    if (!student_id || !name) {
        return res.status(400).json({
            message: "Student ID and name required"
        });
    }

    try {

        db.prepare(`
            INSERT INTO students
            (student_id, name, department, year, email)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            student_id,
            name,
            department || "",
            year || "",
            email || ""
        );

        res.json({
            message: "Student added successfully"
        });

    } catch (error) {

        res.status(400).json({
            message: "Student ID already exists"
        });

    }
});

// ===============================
// UPDATE STUDENT
// ===============================

app.put("/api/students/:student_id", (req, res) => {

    const studentId = req.params.student_id;

    const {
        name,
        department,
        year,
        email
    } = req.body;

    const result = db.prepare(`
        UPDATE students
        SET
            name = ?,
            department = ?,
            year = ?,
            email = ?
        WHERE student_id = ?
    `).run(
        name,
        department || "",
        year || "",
        email || "",
        studentId
    );

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    res.json({
        message: "Student updated successfully"
    });
});

// ===============================
// DELETE STUDENT
// ===============================

app.delete("/api/students/:student_id", (req, res) => {

    const studentId = req.params.student_id;

    db.prepare(
        "DELETE FROM attendance WHERE student_id = ?"
    ).run(studentId);

    db.prepare(
        "DELETE FROM results WHERE student_id = ?"
    ).run(studentId);

    db.prepare(
        "DELETE FROM fees WHERE student_id = ?"
    ).run(studentId);

    db.prepare(
        "DELETE FROM users WHERE user_id = ?"
    ).run(studentId);

    const result = db.prepare(`
        DELETE FROM students
        WHERE student_id = ?
    `).run(studentId);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    res.json({
        message: "Student deleted successfully"
    });
});

// ===============================
// GET ALL FACULTY
// ===============================

app.get("/api/faculty", (req, res) => {

    const faculty = db
        .prepare(`
            SELECT
                faculty_id,
                name,
                department,
                course,
                email
            FROM faculty
            ORDER BY faculty_id
        `)
        .all();

    res.json(faculty);
});

// ===============================
// ADD FACULTY
// ===============================

app.post("/api/faculty", (req, res) => {

    const {
        faculty_id,
        name,
        department,
        course,
        email
    } = req.body;

    if (!faculty_id || !name) {
        return res.status(400).json({
            message: "Faculty ID and name required"
        });
    }

    try {

        db.prepare(`
            INSERT INTO faculty
            (faculty_id, name, department, course, email)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            faculty_id,
            name,
            department || "",
            course || "",
            email || ""
        );

        res.json({
            message: "Faculty added successfully"
        });

    } catch (error) {

        res.status(400).json({
            message: "Faculty ID already exists"
        });

    }
});

// ===============================
// UPDATE FACULTY
// ===============================

app.put("/api/faculty/:faculty_id", (req, res) => {

    const facultyId = req.params.faculty_id;

    const {
        name,
        department,
        course,
        email
    } = req.body;

    const result = db.prepare(`
        UPDATE faculty
        SET
            name = ?,
            department = ?,
            course = ?,
            email = ?
        WHERE faculty_id = ?
    `).run(
        name,
        department || "",
        course || "",
        email || "",
        facultyId
    );

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Faculty not found"
        });
    }

    res.json({
        message: "Faculty updated successfully"
    });
});

// ===============================
// DELETE FACULTY
// ===============================

app.delete("/api/faculty/:faculty_id", (req, res) => {

    const facultyId = req.params.faculty_id;

    db.prepare(
        "DELETE FROM users WHERE user_id = ?"
    ).run(facultyId);

    const result = db.prepare(`
        DELETE FROM faculty
        WHERE faculty_id = ?
    `).run(facultyId);

    if (result.changes === 0) {
        return res.status(404).json({
            message: "Faculty not found"
        });
    }

    res.json({
        message: "Faculty deleted successfully"
    });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log("");
    console.log("====================================");
    console.log("CollegeConnect Backend Running!");
    console.log("====================================");
    console.log("Server: http://localhost:5000");
    console.log("====================================");
});