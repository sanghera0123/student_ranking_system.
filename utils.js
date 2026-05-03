// utils.js - Utility Functions for Student Ranking System

/**
 * UTILITY FUNCTIONS
 * Helper functions for calculations, formatting, and validation
 */

/**
 * Calculate total marks and percentage for a student
 * 
 * @param {Object} student - Student object with marks
 * @param {Array} subjects - List of subjects
 * @returns {Object} - Student with calculated fields
 */
function calculateStudentMetrics(student, subjects) {
    const totalMarks = Object.values(student.marks).reduce((sum, mark) => sum + mark, 0);
    const maxPossibleMarks = subjects.length * 100;
    const percentage = (totalMarks / maxPossibleMarks) * 100;
    
    return {
        ...student,
        totalMarks: totalMarks,
        percentage: parseFloat(percentage.toFixed(2))
    };
}

/**
 * Calculate grade based on percentage
 * 
 * @param {number} percentage - Student's percentage
 * @returns {string} - Grade letter
 */
function calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
}

/**
 * Get grade class for styling
 * 
 * @param {string} grade - Grade letter
 * @returns {string} - CSS class name
 */
function getGradeClass(grade) {
    const gradeMap = {
        'A+': 'grade-A',
        'A': 'grade-A',
        'B+': 'grade-B',
        'B': 'grade-B',
        'C': 'grade-C',
        'D': 'grade-D',
        'F': 'grade-D'
    };
    return gradeMap[grade] || 'grade-D';
}

/**
 * Validate marks input
 * 
 * @param {number} marks - Marks to validate
 * @returns {boolean} - True if valid
 */
function isValidMarks(marks) {
    return !isNaN(marks) && marks >= 0 && marks <= 100;
}

/**
 * Calculate overall statistics
 * 
 * @param {Array} students - Array of student objects
 * @param {Array} subjects - Array of subjects
 * @returns {Object} - Statistics object
 */
function calculateStatistics(students, subjects) {
    if (!students || students.length === 0) {
        return {
            totalStudents: 0,
            averagePercentage: 0,
            highestPercentage: 0,
            lowestPercentage: 0,
            passRate: 0,
            totalMarksSum: 0,
            subjectAverages: {}
        };
    }
    
    const totalStudents = students.length;
    const percentages = students.map(s => s.percentage);
    const averagePercentage = percentages.reduce((a, b) => a + b, 0) / totalStudents;
    const highestPercentage = Math.max(...percentages);
    const lowestPercentage = Math.min(...percentages);
    const passCount = students.filter(s => s.percentage >= 40).length;
    const passRate = (passCount / totalStudents) * 100;
    const totalMarksSum = students.reduce((sum, s) => sum + s.totalMarks, 0);
    
    // Calculate subject-wise averages
    const subjectAverages = {};
    subjects.forEach(subject => {
        const marksSum = students.reduce((sum, student) => sum + (student.marks[subject] || 0), 0);
        subjectAverages[subject] = marksSum / totalStudents;
    });
    
    return {
        totalStudents,
        averagePercentage: parseFloat(averagePercentage.toFixed(2)),
        highestPercentage: parseFloat(highestPercentage.toFixed(2)),
        lowestPercentage: parseFloat(lowestPercentage.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(2)),
        totalMarksSum,
        subjectAverages
    };
}

/**
 * Export data to JSON file
 * 
 * @param {Array} subjects - List of subjects
 * @param {Array} students - List of students
 */
function exportToJSON(subjects, students) {
    const data = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        subjects: subjects,
        students: students.map(s => ({
            rollNo: s.rollNo,
            name: s.name,
            marks: s.marks,
            totalMarks: s.totalMarks,
            percentage: s.percentage,
            createdAt: s.createdAt || new Date().toISOString()
        }))
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_ranking_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Import data from JSON
 * 
 * @param {File} file - JSON file to import
 * @returns {Promise} - Promise resolving to imported data
 */
function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}

/**
 * Show toast notification
 * 
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info'
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Validate student form data
 * 
 * @param {number} rollNo - Roll number
 * @param {string} name - Student name
 * @param {Object} marks - Marks object
 * @param {Array} students - Existing students array
 * @param {boolean} isEdit - Whether in edit mode
 * @returns {Object} - Validation result
 */
function validateStudentData(rollNo, name, marks, students, isEdit = false) {
    // Check roll number
    if (!rollNo || isNaN(rollNo)) {
        return { valid: false, message: 'Please enter a valid roll number' };
    }
    
    // Check name
    if (!name || name.trim().length < 2) {
        return { valid: false, message: 'Please enter a valid name (min 2 characters)' };
    }
    
    // Check for duplicate roll number (only if not in edit mode)
    if (!isEdit && students.some(s => s.rollNo === rollNo)) {
        return { valid: false, message: `Roll number ${rollNo} already exists` };
    }
    
    // Check marks
    for (const [subject, mark] of Object.entries(marks)) {
        if (!isValidMarks(mark)) {
            return { valid: false, message: `Invalid marks for ${subject}. Must be between 0-100` };
        }
    }
    
    return { valid: true, message: 'Valid data' };
}

/**
 * Generate unique ID
 * 
 * @returns {string} - Unique ID
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date for display
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Deep clone an object
 * 
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function for performance optimization
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}