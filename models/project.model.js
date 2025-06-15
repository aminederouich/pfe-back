const { db } = require("../config/firebase");
const { collection, getDocs, query, where, addDoc, doc, deleteDoc, setDoc } = require("firebase/firestore");

class Project {
  constructor(projectData) {
    this.projectName = projectData.projectName;
    this.key = projectData.key;
    this.projectType = projectData.projectType;
    this.projectCategory = projectData.projectCategory;
    this.projectLead = projectData.projectLead;
  }

  static async findByKey(key) {
    const projectRef = collection(db, "project");
    const q = query(projectRef, where("key", "==", key));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  static async findAll() {
    const projectRef = collection(db, "project");
    const querySnapshot = await getDocs(projectRef);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return projects;
  }

  static async deleteById(id) {
    const projectRef = doc(db, "project", id);
    await deleteDoc(projectRef);
    return { message: `Project with id ${id} deleted successfully.` };
   }


  async save() {
    const projectRef = collection(db, "project");
    const docRef = await addDoc(projectRef, {
      projectName: this.projectName,
      key: this.key,
      projectType: this.projectType,
      projectCategory: this.projectCategory,
      projectLead: this.pprojectDatarojectLead
    });
    return { id: docRef.id, ...this };
  }
  
  static async updateById(projectId,
        projectName,
        key,
        projectType,
        projectCategory,
        projectLead) {
    const projectRef = doc(db, "project", projectId);
    await setDoc(projectRef, {
      projectName: projectName,
      key: key,
      projectType: projectType,
      projectCategory: projectCategory,
      projectLead: projectLead
    });
    return { projectId, ...{projectName,
        key,
        projectType,
        projectCategory,
        projectLead} };
  }
}

module.exports = Project;