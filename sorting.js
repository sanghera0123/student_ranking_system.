// sorting.js - Stable Merge Sort Implementation for Student Ranking

/**
 * STUDENT RANKING SYSTEM - STABLE MERGE SORT
 * 
 * This file contains the core sorting algorithm used for ranking students.
 * The implementation is STABLE, meaning that when two students have the same
 * total marks, their original order (by insertion time) is preserved.
 * 
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

/**
 * Main function to sort students using Stable Merge Sort
 * Sorts in descending order (highest marks first)
 * 
 * @param {Array} students - Array of student objects
 * @returns {Array} - Sorted array of students
 */
function stableMergeSortStudents(students) {
    // Base case: array with 0 or 1 element is already sorted
    if (students.length <= 1) {
        return students;
    }
    
    // Divide the array into two halves
    const mid = Math.floor(students.length / 2);
    const leftHalf = students.slice(0, mid);
    const rightHalf = students.slice(mid);
    
    // Recursively sort both halves
    const sortedLeft = stableMergeSortStudents(leftHalf);
    const sortedRight = stableMergeSortStudents(rightHalf);
    
    // Merge the sorted halves
    return mergeStable(sortedLeft, sortedRight);
}

/**
 * Merge two sorted arrays in a stable manner
 * 
 * @param {Array} left - Sorted left array
 * @param {Array} right - Sorted right array
 * @returns {Array} - Merged sorted array
 */
function mergeStable(left, right) {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;
    
    // Compare elements from both arrays
    while (leftIndex < left.length && rightIndex < right.length) {
        const leftStudent = left[leftIndex];
        const rightStudent = right[rightIndex];
        
        // For descending order (higher marks first)
        if (leftStudent.totalMarks > rightStudent.totalMarks) {
            result.push(leftStudent);
            leftIndex++;
        } 
        else if (leftStudent.totalMarks < rightStudent.totalMarks) {
            result.push(rightStudent);
            rightIndex++;
        }
        else {
            /**
             * STABILITY IS ENSURED HERE:
             * When total marks are equal, we take from the LEFT array first.
             * This preserves the original order of students with identical marks.
             * In a stable sort, elements that compare as equal keep their
             * relative order from the original input.
             */
            result.push(leftStudent);
            leftIndex++;
        }
    }
    
    // Add remaining elements from left array
    while (leftIndex < left.length) {
        result.push(left[leftIndex]);
        leftIndex++;
    }
    
    // Add remaining elements from right array
    while (rightIndex < right.length) {
        result.push(right[rightIndex]);
        rightIndex++;
    }
    
    return result;
}

/**
 * Alternative merge sort for ascending order (lower marks first)
 * Used for different ranking scenarios
 * 
 * @param {Array} students - Array of student objects
 * @returns {Array} - Sorted array in ascending order
 */
function stableMergeSortAscending(students) {
    if (students.length <= 1) {
        return students;
    }
    
    const mid = Math.floor(students.length / 2);
    const left = stableMergeSortAscending(students.slice(0, mid));
    const right = stableMergeSortAscending(students.slice(mid));
    
    return mergeStableAscending(left, right);
}

function mergeStableAscending(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        // For ascending order (lower marks first)
        if (left[i].totalMarks < right[j].totalMarks) {
            result.push(left[i]);
            i++;
        } else if (left[i].totalMarks > right[j].totalMarks) {
            result.push(right[j]);
            j++;
        } else {
            // Stable: take from left when equal
            result.push(left[i]);
            i++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}

/**
 * Calculate and assign ranks to students
 * Handles ties properly (same marks = same rank)
 * 
 * @param {Array} students - Array of student objects
 * @returns {Array} - Students with ranks assigned
 */
function assignRanks(students) {
    if (!students || students.length === 0) {
        return students;
    }
    
    // First, sort using stable merge sort
    const sortedStudents = stableMergeSortStudents([...students]);
    
    // Assign ranks
    if (sortedStudents.length > 0) {
        sortedStudents[0].rank = 1;
        
        for (let i = 1; i < sortedStudents.length; i++) {
            if (sortedStudents[i].totalMarks === sortedStudents[i-1].totalMarks) {
                // Tie: assign same rank
                sortedStudents[i].rank = sortedStudents[i-1].rank;
            } else {
                // Different marks: assign next sequential rank
                sortedStudents[i].rank = i + 1;
            }
        }
    }
    
    return sortedStudents;
}


function demonstrateStability() {
    const testStudents = [
        { id: 1, name: "Student A", totalMarks: 85, order: 1 },
        { id: 2, name: "Student B", totalMarks: 92, order: 2 },
        { id: 3, name: "Student C", totalMarks: 85, order: 3 },
        { id: 4, name: "Student D", totalMarks: 85, order: 4 },
        { id: 5, name: "Student E", totalMarks: 90, order: 5 }
    ];
    
    console.log("Original Order:", testStudents.map(s => s.name));
    
    const sorted = stableMergeSortStudents(testStudents);
    console.log("Sorted Order:", sorted.map(s => s.name));
    console.log("Note: Students with same marks (A, C, D) maintain their relative order!");
}