const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const router = express();

router.use(express.static(path.join(__dirname, 'build')));

router.use(bodyParser.json())

router.get('/ping', function (req, res) {
 return res.send('pong');
});

router.listen(process.env.PORT || 3000);

module.exports = router;
