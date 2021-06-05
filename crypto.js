const crypto = require("crypto")

let result = crypto.createHash("sha256")
      .update("testsomething")
      .digest("hex");

console.log(result)

let result2 = crypto.createHash("sha256")
    .update("testsomething 123")
    .digest("hex");

console.log(result === result2)

