const crypto = require("crypto");

const generateHash = (content) => crypto.createHash("sha256")
    .update(content)
    .digest("hex");

class MerkleTree {
    constructor(name, content, level, parent) {
        this.name = name;
        this.content = content;
        this.level = level
        this.parent = parent

        this.children = []

        this.hash = generateHash(JSON.stringify({
            name, level, content
        }))
    }

    setContent(content) {
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
        this.children.push(node);
        this.hash = generateHash(this.getChildHashes())
    }
}

const root = new MerkleTree("rootnode", "root", 0)
const child1 = new MerkleTree("child1", "child 1 content",root.level + 1, root)
const child2 = new MerkleTree("child2", "child 2 content", root.level + 1, root)
const child3 = new MerkleTree("child3", "child 3 content", child1.level + 1, child1)


child1.addChild(child3)
root.addChild(child1)
root.addChild(child2)

/*
        Root
      child1    child2
   child3
 */

// d994e7ce4af858e023bdcdc6639cb906248b4e60b77961f7f58c726e1400313b
// dd41d18560010007d0f4b46ad3547554326441b21103bf15354eb90b4fc117ba
/*
        root (bee1360917ba70222e1407031c2831510dec4c6f0eef53c4e43591b9b8533d75)
    child1 (xxx)     child2(yyyy)

    previs = xxx + yyyy
    root.hash = xxxyyy

 */

child3.setContent("hey i'm changing!")

console.log(root.hash)
