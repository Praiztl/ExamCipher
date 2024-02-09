Scenario: Exam Access Control in ExamCipher
Background: ExamCipher is an online platform used by a university to administer exams. The university wants to ensure that exams are only accessible to students enrolled in the respective courses and to the faculty members who teach those courses.
Users and Attributes:
•	Students: Assigned attributes based on their enrollment, such as ["student", "math101", "year1"], indicating the user is a first-year student enrolled in Math 101.
•	Teachers: Assigned attributes based on their teaching roles, like ["teacher", "math101"], showing the user teaches Math 101.
•	Department Heads: Assigned broader attributes, such as ["dept_head_math"], allowing access to all math department exams.
Exam Encryption:
•	Each exam is encrypted with a policy that reflects the course and the role required to access it. For example, the Math 101 final exam is encrypted with the policy ("student" AND "math101") OR ("teacher" AND "math101") OR "dept_head_math". This policy ensures that only students enrolled in Math 101, teachers of Math 101, or the math department head can decrypt and access the exam.
Accessing an Exam:
•	When a user attempts to access an exam on the ExamCipher site:
•	The system retrieves the encrypted exam content from the database.
•	The user's client application (or the server, depending on where decryption is performed) attempts to decrypt the exam using the user's CP-ABE key.
•	The decryption process checks if the user's attributes satisfy the exam's access policy.
•	If the policy is satisfied, the exam is decrypted, and the user can view it. For example, a student with attributes ["student", "math101", "year1"] can access the Math 101 exam because their attributes match the policy.
•	If the policy is not satisfied, decryption fails, and the user receives a message, such as "You are not authorized to access this exam," ensuring that users can only access exams for which they are authorized.

