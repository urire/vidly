const fs = require('fs');
const path = require("path");

module.exports = app => {
    fs.readdir(path.join(path.parse(__dirname).dir, 'routes'), (err, files) => {
        if (err) throw err; 
      
        files.forEach(file => {
            const route = path.parse(file).name;
            
            app.use(`/api/${route}`, require(`../routes/${route}`));
        });     
    });
};
