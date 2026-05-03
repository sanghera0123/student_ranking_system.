// script.js - Main Application Logic for Student Ranking System

/**
 * MAIN APPLICATION STATE
 */
let subjects = [];
let students = [];
let editMode = false;
let editRollNo = null;

/**
 * Initialize the application
 */
function init() {
    loadFromLocalStorage();
    updateSubjectsList();
    updateMarksInputs();
    updateStatistics();
    
    // Add event listeners
    document.getElementById('studentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveStudent();
    });
    
    showToast('Welcome to Student Ranking System!', 'info');
}

/**
 * SUBJECT MANAGEMENT
 */
function addSubject() {
    const subjectName = document.getElementById('subjectName').value.trim();
    
    if (!subjectName) {
        showToast('Please enter a subject name', 'error');
        return;
    }
    
    if (subjects.includes(subjectName)) {
        showToast('Subject already exists!', 'error');
        return;
    }
    
    subjects.push(subjectName);
    document.getElementById('subjectName').value = '';
    
    updateSubjectsList();
    updateMarksInputs();
    saveToLocalStorage();
    
    showToast(`Subject "${subjectName}" added successfully!`, 'success');
    updateStatistics();
}

function removeSubject(index) {
    const subjectName = subjects[index];
    subjects.splice(index, 1);
    
    // Remove marks for this subject from all students
    students.forEach(student => {
        delete student.marks[subjectName];
        const updatedStudent = calculateStudentMetrics(student, subjects);
        Object.assign(student, updatedStudent);
    });
    
    updateSubjectsList();
    updateMarksInputs();
    saveToLocalStorage();
    calculateAndDisplayRanks();
    
    showToast(`Subject "${subjectName}" removed`, 'info');
}

function updateSubjectsList() {
    const container = document.getElementById('subjectsList');
    document.getElementById('totalSubjects').textContent = subjects.length;
    
    if (subjects.length === 0) {
        container.innerHTML = '<div class="empty-state-mini">No subjects added yet. Add your first subject!</div>';
        return;
    }
    
    container.innerHTML = subjects.map((subject, index) => `
        <div class="subject-tag">
            📚 ${subject}
            <button onclick="removeSubject(${index})" title="Remove subject">✕</button>
        </div>
    `).join('');
}

function updateMarksInputs() {
    const container = document.getElementById('marksInputs');
    
    if (subjects.length === 0) {
        container.innerHTML = '<div class="empty-state-mini">⚠️ Please add subjects first!</div>';
        return;
    }
    
    container.innerHTML = subjects.map(subject => `
        <div class="mark-input">
            <label>${subject}:</label>
            <input type="number" 
                   id="mark_${subject.replace(/\s/g, '_')}" 
                   min="0" 
                   max="100" 
                   value="0"
                   placeholder="0-100">
        </div>
    `).join('');
}

/**
 * STUDENT MANAGEMENT
 */
function saveStudent() {
    const rollNo = parseInt(document.getElementById('rollNo').value);
    const name = document.getElementById('studentName').value.trim();
    
    // Collect marks
    const marks = {};
    subjects.forEach(subject => {
        const inputId = `mark_${subject.replace(/\s/g, '_')}`;
        const markInput = document.getElementById(inputId);
        if (markInput) {
            marks[subject] = parseInt(markInput.value) || 0;
        }
    });
    
    // Validate data
    const validation = validateStudentData(rollNo, name, marks, students, editMode);
    if (!validation.valid) {
        showToast(validation.message, 'error');
        return;
    }
    
    if (editMode) {
        // Update existing student
        const index = students.findIndex(s => s.rollNo === editRollNo);
        if (index !== -1) {
            students[index] = {
                ...students[index],
                rollNo: rollNo,
                name: name,
                marks: marks,
                updatedAt: new Date().toISOString()
            };
            students[index] = calculateStudentMetrics(students[index], subjects);
            showToast(`Student "${name}" updated successfully!`, 'success');
        }
        editMode = false;
        editRollNo = null;
        document.getElementById('saveBtn').innerHTML = '➕ Add Student';
    } else {
        // Add new student
        const newStudent = {
            id: generateUniqueId(),
            rollNo: rollNo,
            name: name,
            marks: marks,
            createdAt: new Date().toISOString()
        };
        students.push(calculateStudentMetrics(newStudent, subjects));
        showToast(`Student "${name}" added successfully!`, 'success');
    }
    
    clearForm();
    saveToLocalStorage();
    calculateAndDisplayRanks();
    updateStatistics();
}

function editStudent(rollNo) {
    const student = students.find(s => s.rollNo === rollNo);
    if (!student) return;
    
    editMode = true;
    editRollNo = rollNo;
    
    document.getElementById('rollNo').value = student.rollNo;
    document.getElementById('studentName').value = student.name;
    
    subjects.forEach(subject => {
        const inputId = `mark_${subject.replace(/\s/g, '_')}`;
        const markInput = document.getElementById(inputId);
        if (markInput && student.marks[subject] !== undefined) {
            markInput.value = student.marks[subject];
        }
    });
    
    document.getElementById('saveBtn').innerHTML = '✏️ Update Student';
    showToast(`Editing student: ${student.name}`, 'info');
}

function deleteStudent(rollNo) {
    if (confirm('Are you sure you want to delete this student?')) {
        const student = students.find(s => s.rollNo === rollNo);
        students = students.filter(s => s.rollNo !== rollNo);
        saveToLocalStorage();
        calculateAndDisplayRanks();
        updateStatistics();
        showToast(`Student "${student.name}" deleted`, 'info');
    }
}

function clearForm() {
    document.getElementById('rollNo').value = '';
    document.getElementById('studentName').value = '';
    
    subjects.forEach(subject => {
        const inputId = `mark_${subject.replace(/\s/g, '_')}`;
        const markInput = document.getElementById(inputId);
        if (markInput) markInput.value = 0;
    });
    
    editMode = false;
    editRollNo = null;
    document.getElementById('saveBtn').innerHTML = '➕ Add Student';
}

/**
 * RANKING AND DISPLAY
 */
function calculateAndDisplayRanks() {
    if (students.length === 0) {
        displayEmptyState();
        updateStatistics();
        return;
    }
    
    // Use the stable merge sort from sorting.js
    const rankedStudents = assignRanks(students);
    displayRankingTable(rankedStudents);
    updateStatistics();
}

function displayRankingTable(rankedStudents) {
    const tbody = document.getElementById('rankingBody');
    
    if (rankedStudents.length === 0) {
        displayEmptyState();
        return;
    }
    
    tbody.innerHTML = rankedStudents.map(student => {
        const grade = calculateGrade(student.percentage);
        const gradeClass = getGradeClass(grade);
        const rankClass = student.rank === 1 ? 'rank-1' : (student.rank === 2 ? 'rank-2' : (student.rank === 3 ? 'rank-3' : ''));
        
        return `
            <tr>
                <td class="${rankClass}"><strong>${student.rank}</strong></td>
                <td>${student.rollNo}</td>
                <td><strong>${escapeHtml(student.name)}</strong></td>
                <td>${student.totalMarks}</td>
                <td>${student.percentage}%</td>
                <td><span class="${gradeClass}">${grade}</span></td>
                <td>
                    <button onclick="editStudent(${student.rollNo})" class="btn btn-sm btn-info">✏️ Edit</button>
                    <button onclick="deleteStudent(${student.rollNo})" class="btn btn-sm btn-danger">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function displayEmptyState() {
    const tbody = document.getElementById('rankingBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <div class="empty-icon">📭</div>
                <p>No students added yet</p>
                <small>Add subjects and students to see rankings</small>
            </td>
        </tr>
    `;
}

/**
 * STATISTICS UPDATE
 */
function updateStatistics() {
    const stats = calculateStatistics(students, subjects);
    
    document.getElementById('totalStudents').textContent = stats.totalStudents;
    document.getElementById('statTotalStudents').textContent = stats.totalStudents;
    document.getElementById('statAvgPercentage').textContent = stats.averagePercentage + '%';
    document.getElementById('statHighestScore').textContent = stats.highestPercentage + '%';
    document.getElementById('statPassRate').textContent = stats.passRate + '%';
    
    // Update header stats
    const headerStats = document.querySelectorAll('.stat-value');
    if (headerStats.length > 0) {
        document.getElementById('totalStudents').textContent = stats.totalStudents;
    }
}

/**
 * DATA MANAGEMENT
 */
function loadSampleData() {
    if (students.length > 0 && !confirm('Loading sample data will replace current data. Continue?')) {
        return;
    }
    
    // Sample subjects
    subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];
    
    // Sample students
    const sampleStudents = [
        { rollNo: 101, name: 'Alice Johnson', marks: { 'Mathematics': 92, 'Physics': 88, 'Chemistry': 85, 'English': 95, 'Computer Science': 98 } },
        { rollNo: 102, name: 'Bob Smith', marks: { 'Mathematics': 78, 'Physics': 85, 'Chemistry': 90, 'English': 82, 'Computer Science': 88 } },
        { rollNo: 103, name: 'Charlie Brown', marks: { 'Mathematics': 96, 'Physics': 94, 'Chemistry': 92, 'English': 98, 'Computer Science': 97 } },
        { rollNo: 104, name: 'Diana Prince', marks: { 'Mathematics': 85, 'Physics': 82, 'Chemistry': 88, 'English': 90, 'Computer Science': 86 } },
        { rollNo: 105, name: 'Eve Adams', marks: { 'Mathematics': 75, 'Physics': 78, 'Chemistry': 80, 'English': 85, 'Computer Science': 82 } }
    ];
    
    students = sampleStudents.map(student => {
        const newStudent = {
            id: generateUniqueId(),
            ...student,
            createdAt: new Date().toISOString()
        };
        return calculateStudentMetrics(newStudent, subjects);
    });
    
    updateSubjectsList();
    updateMarksInputs();
    saveToLocalStorage();
    calculateAndDisplayRanks();
    
    showToast('Sample data loaded successfully!', 'success');
}

function exportData() {
    if (students.length === 0 && subjects.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    exportToJSON(subjects, students);
    showToast('Data exported successfully!', 'success');
}

function importData() {
    document.getElementById('importFile').click();
}

async function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const data = await importFromJSON(file);
        
        if (data.subjects && data.students) {
            subjects = data.subjects;
            students = data.students.map(s => ({
                ...s,
                totalMarks: s.totalMarks,
                percentage: s.percentage
            }));
            
            updateSubjectsList();
            updateMarksInputs();
            saveToLocalStorage();
            calculateAndDisplayRanks();
            
            showToast('Data imported successfully!', 'success');
        } else {
            showToast('Invalid data format', 'error');
        }
    } catch (error) {
        showToast('Error importing data: ' + error.message, 'error');
    }
    
    event.target.value = '';
}

function printReport() {
    window.print();
}

/**
 * LOCAL STORAGE
 */
function saveToLocalStorage() {
    const data = {
        subjects: subjects,
        students: students,
        lastSaved: new Date().toISOString()
    };
    localStorage.setItem('studentRankingSystem', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('studentRankingSystem');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            subjects = data.subjects || [];
            students = data.students || [];
            showToast('Loaded saved data', 'info');
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

/**
 * UI UTILITIES
 */
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const btn = event.target;
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        btn.textContent = '−';
    } else {
        panel.style.display = 'none';
        btn.textContent = '+';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', init);