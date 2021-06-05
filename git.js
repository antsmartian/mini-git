const crypto = require("crypto");

const generateHash = (content) => crypto.createHash("sha256")
    .update(content)
    .digest("hex");

const FILE = "file"
const DIRECTORY = "directory"

const isFile = (type) => type === FILE
const isDirectory = (type) => type === DIRECTORY

class Git {
    constructor(type,name, level, parent) {
        this.type = type;
        this.name = name;
        this.content = "";
        this.level = level
        this.parent = parent

        this.children = []

        if (isFile(type)) {
            this.hash = generateHash(JSON.stringify({
                name, level, content: this.content
            }))
        } else {
            this.hash = ""; // for directories
        }

        this.commitedHash = "";
        this.modified = false;
    }

    setContent(content) {
        if(!isFile(this.type)) return;

        this.content = content;

        this.hash = generateHash(JSON.stringify({
            type: this.type,
            name: this.name,
            level: this.level,
            content: this.content
        }))

        this.parent.updateChildrenHashes()
    }

    updateChildrenHashes() {
        this.hash = generateHash(this.getChildHashes())
        this.parent && this.parent.updateChildrenHashes();
    }

    getChildHashes() {
        return  this.children.reduce((previous, current) => previous += current.hash, "")
    }

    addChild(node) {
        if(!isDirectory(this.type)) return;
        this.children.push(node);
        this.hash = generateHash(this.getChildHashes())
    }

    commit() {
        this.commitedHash = this.hash;
        this.modified = false;
        if (isDirectory(this.type)) {
            this.children.forEach((child) => child.commit())
        }
    }

    status(parent) {
        const node = parent || this;
        if (node.hash !== node.commitedHash) {
            node.modified = true;
            if (isDirectory(node.type)) {
                node.children.forEach((n) => this.status(n))
            }
        }
    }
}

let indent = "", directoryPrinted = true, directoryName ="";
function printTree(root) {
    const indent = (root) => {
        for(let i=0;i<root.level;i++) {
            process.stdout.write("\t");
        }
    }

    if(root.type === DIRECTORY && root.name !== directoryName) {
        indent(root)
        if (root.modified) {
            console.log('\x1b[33m%s\x1b[0m ', root.name)
        } else {
            console.log(root.name)
        }

        directoryPrinted = false;
        directoryName = root.name;
    }

    root.children.forEach((child) => {
        if (child.type === FILE) {
            indent(child);

            if (child.modified) {
                console.log('\x1b[33m%s\x1b[0m ', `file name: ${child.name}`)
            } else {
                console.log("file name: ",child.name)
            }
        }

        if (child.type === DIRECTORY){
            printTree(child)
        }
    })
}


/*
    Directory -> Directory -> File/Directory
    File


 */

const root = new Git(DIRECTORY, "root directory", 0)
const secondDirectory = new Git(DIRECTORY, "second direcory", root.level + 1)

const file = new Git(FILE, "testFile", root.level + 1, root)
file.setContent("someData")

const file2 = new Git(FILE, "helloWorld", root.level + 1, root);

const secondFile = new Git(FILE, "secondDirFile", secondDirectory.level + 1, secondDirectory)



secondDirectory.addChild(secondFile)
root.addChild(file)
root.addChild(file2)
root.addChild(secondDirectory)
root.commit();

root.status()
printTree(root);

file2.setContent("axacscdas")

root.status()
printTree(root);

root.commit();

root.status()
printTree(root);












