const Database = require("better-sqlite3");

const db = new Database("collegeconnect.db");


// ===============================
// TABLE
// ===============================

db.exec(`
CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    course TEXT,
    email TEXT
);
`);


// ===============================
// FACULTY DATA
// ===============================

const facultyNames = [
    "Dr. Aravind Kumar",
    "Dr. Priya Raj",
    "Dr. Karthik M",
    "Dr. Divya S",
    "Dr. Rahul Kumar",
    "Dr. Meena Ravi",
    "Dr. Suresh Babu",
    "Dr. Anjali Krishnan",
    "Dr. Vijay Shankar",
    "Dr. Kavitha R",
    "Dr. Naveen Kumar",
    "Dr. Deepa M",
    "Dr. Sanjay Raj",
    "Dr. Harini S",
    "Dr. Prakash Kumar",
    "Dr. Swetha R",
    "Dr. Manoj Krishnan",
    "Dr. Nandhini M",
    "Dr. Ajay Kumar",
    "Dr. Keerthana S",
    "Dr. Mohan Raj",
    "Dr. Pooja R",
    "Dr. Dinesh Kumar",
    "Dr. Pavithra M",
    "Dr. Arun Shankar",
    "Dr. Sneha R",
    "Dr. Vishnu Kumar",
    "Dr. Aishwarya S",
    "Dr. Sathish Raj",
    "Dr. Nithya M",
    "Dr. Gokul Kumar",
    "Dr. Priyanka R",
    "Dr. Rohit S",
    "Dr. Lakshmi Kumar",
    "Dr. Surya Raj",
    "Dr. Keerthi M",
    "Dr. Ramesh Kumar",
    "Dr. Anu S",
    "Dr. Bharath Raj",
    "Dr. Shalini M",
    "Dr. Vignesh Kumar",
    "Dr. Monika R",
    "Dr. Hari Shankar",
    "Dr. Ramya S",
    "Dr. Siva Kumar",
    "Dr. Rekha M",
    "Dr. Ashwin Raj",
    "Dr. Geetha S"
];

const departments = [
    "Information Technology",
    "Computer Science and Engineering",
    "Artificial Intelligence and Data Science",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering"
];

const courses = [
    "B.Tech IT",
    "B.Tech CSE",
    "B.Tech AI & DS",
    "B.Tech ECE",
    "B.Tech EEE",
    "B.Tech ME"
];


// ===============================
// CLEAR OLD FACULTY DETAILS
// ===============================

db.prepare(`
    DELETE FROM faculty
`).run();


// ===============================
// INSERT FACULTY
// ===============================

const insertFaculty = db.prepare(`
    INSERT INTO faculty
    (
        faculty_id,
        name,
        department,
        course,
        email
    )
    VALUES (?, ?, ?, ?, ?)
`);

const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users
    (
        user_id,
        password,
        role
    )
    VALUES (?, ?, ?)
`);


for(let i = 0; i < facultyNames.length; i++){

    const facultyId =
        "FAC" + String(i + 1).padStart(3, "0");

    const name =
        facultyNames[i];

    const department =
        departments[i % departments.length];

    const course =
        courses[i % courses.length];

    const email =
        facultyId.toLowerCase() +
        "@collegeconnect.demo";

    const password =
        "Fac@" +
        String(i + 1).padStart(3, "0");


    // Faculty details
    insertFaculty.run(
        facultyId,
        name,
        department,
        course,
        email
    );


    // Faculty login account
    insertUser.run(
        facultyId,
        password,
        "faculty"
    );
}


// ===============================
// RESULT
// ===============================

const count = db.prepare(`
    SELECT COUNT(*) AS total
    FROM faculty
`).get();

console.log("");
console.log("====================================");
console.log("Faculty Database Seed Completed!");
console.log("====================================");
console.log("Faculty Created :", count.total);
console.log("====================================");
console.log("Example Login");
console.log("Faculty ID      : FAC001");
console.log("Password        : Fac@001");
console.log("====================================");


db.close();