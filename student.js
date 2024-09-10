const express = require('express');
const admin = require('firebase-admin');
require('dotenv').config(); // nap bien moi truong tu file .env

const app = express();
app.use(express.json()); //doc du lieu json tu request body

// khoi tao moi truong SDK cuar firebase
admin.initializeApp({
    credential:admin.credential.cert({
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Xử lý ký tự xuống dòng
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        project_id: process.env.FIREBASE_PROJECT_ID,
    }),
});

const db = admin.firestore();
const collection = db.collection('students');

//CRUD API
//get
app.get('/students', async (req, res) => {
    try {
        const snapshot = await collection.get();
        const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send('Error fetching students: ' + error.message);
    }
});



//post 
app.post('/students', async(req, res) => {
    try{
        const student = req.body;
        const docDef = await collection.add(student);
        res.status(201).send({ id: docDef.id, message: 'student created successfully' });

    }catch(error){
        res.status(500).send('Error creating student:' + error.message)
    }
});

//get/id
app.get('students/:id' ,async(req,res) => {
    try{
        const doc = await collection.doc(req.params.id).get();
        if(!doc.exists){
            return res.status(404).send('student not found');

        }
        res.status(200).json({ id: doc.id, ...doc.data()});
    }catch(error){
        res.status(500).send('Error fetching student: ' + error.message);
    }
});

//delete
app.delete('/students/:id', async (req, res) => {
    try {
      await collection.doc(req.params.id).delete();
      res.status(200).send('student deleted successfully');
    } catch (error) {
      res.status(500).send('Error deleting student: ' + error.message);
    }
  });

// Chạy server với port online hoặc 3000 local
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});