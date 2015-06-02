### `s3polgen.js`:

* Refer to your old mocha tests to get USER object and get username out of it
* Listen to a new event upload/getPolicy
* Design payload of upload/getPolicy (must contain username, what type of upload,
   generatedPolicy, generatedSignature)

### Other TODOs
 * fix lambda execution handsfree
 * Turn test.js into small lib:
	* That users can invoke with `node lambda.js fileToInvoke eventType`
	* eventType can be S3 etc or a string which will be treated as a JSON blob.
