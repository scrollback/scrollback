### Scrollback - Server side

* What sort of image types do we allow?
* Handle file size of content uploads, limit to 2MB
* <del>Create a new module s3polgen</del>
* <del>Create `s3polgen/s3polgen.js`</del>
* <del>Edit `socket.js` to emit http/getPolicy events</del>
* <del>Create `s3polgen/s3polgen-test.js`</del>
* In `s3polgen.js`, listen to a new event http/getPolicy 
* Design payload of http/getPolicy (must contain username, what type of upload,
  generatedPolicy, generatedSignature)

  ### Scrollback - Client side

  * <del>Create `s3polgen/s3polgen-client.js`</del>
  * In s3polgen-client.js file, emit upload event and inside core.emit
    (getPolicy) who has a callback receives policy and signature
    * in store/socket.js add getPolicy events
