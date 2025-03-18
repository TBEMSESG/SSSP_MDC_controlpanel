
var configuration = {
    name: "demo",
    number: 2233
}

/* Opening file for write - file is created if not exists, */
/* otherwise existing file is truncated. */
var fileHandleWrite = tizen.filesystem.openFile("wgt-private/configuration", "w");
console.log("File opened for writing");
fileHandleWrite.writeString(JSON.stringify(configuration));
console.log("String has been written to the file");
fileHandleWrite.close();

/* Opening file for read - this code assumes that there is */
/* a file named "file" in documents directory. */
var fileHandleRead = tizen.filesystem.openFile("documents/file", "r");
console.log("File opened for reading");
var fileContent = fileHandleRead.readString();
console.log("File content: " + fileContent);
fileHandleRead.close();