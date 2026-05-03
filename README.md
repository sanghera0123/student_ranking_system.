# Student Ranking System

A complete web-based student ranking system with **Stable Merge Sort** algorithm, multiple subject support, and comprehensive analytics.

## Features

- ✅ **Stable Merge Sort Algorithm** - Preserves original order for students with equal marks
- ✅ **Multiple Subjects Support** - Add unlimited subjects dynamically
- ✅ **Rank Calculation** - Automatic rank assignment with tie handling
- ✅ **Grade Calculation** - Automatic grade assignment based on percentage
- ✅ **Real-time Statistics** - Average, highest, pass rate, and more
- ✅ **Data Persistence** - Auto-save to localStorage
- ✅ **Import/Export** - Save and load data as JSON files
- ✅ **Print Reports** - Print ranking reports
- ✅ **Responsive Design** - Works on all devices
- ✅ **Toast Notifications** - User-friendly feedback

## How Merge Sort Works in This System

### Stability Explained

In ranking systems, stability is crucial. When two students have the **same total marks**, a stable sort ensures they maintain their original order (by insertion time). This is fair because the first student added isn't arbitrarily placed after the second.

```javascript
// Key stability implementation
if (leftStudent.totalMarks > rightStudent.totalMarks) {
    result.push(leftStudent);  // Left wins
} else if (leftStudent.totalMarks < rightStudent.totalMarks) {
    result.push(rightStudent); // Right wins
} else {
    // EQUAL MARKS: Take from LEFT first (THIS ENSURES STABILITY)
    result.push(leftStudent);
}