const express = require('express');
const app = express()

const path = require('path')
const hbs = require('express-handlebars')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts')
}));

app.use(express.static('public'));

const mysql = require('mysql');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwerty',
    database: 'joga_mysql'
});

con.connect((err) => {
    if (err) throw err;
    console.log('Connected to joga_mysql database');
});

app.get('/', (req, res) => {
    let query = 'SELECT * FROM article ORDER BY published DESC';
    con.query(query, (err, result) => {
        if (err) throw err;
        res.render('index', {
            articles: result
        });
    });
});

app.get('/article/:slug', (req, res) => {
    let query = 'SELECT a.*, au.name AS author_name FROM article a LEFT JOIN author au ON a.author_id = au.id WHERE a.slug = ?';
    con.query(query, [req.params.slug], (err, result) => {
        if (err) throw err;
        res.render('article', {
            article: result
        });
    });
});

app.get('/author/:author_id', (req, res) => {
    let authorQuery = 'SELECT * FROM author WHERE id = ?';
    con.query(authorQuery, [req.params.author_id], (err, authorResult) => {
        if (err) throw err;
        if (!authorResult[0]) {
            return res.status(404).send('Author not found');
        }

        let articlesQuery = 'SELECT * FROM article WHERE author_id = ? ORDER BY published DESC';
        con.query(articlesQuery, [req.params.author_id], (err2, articleResult) => {
            if (err2) throw err2;
            res.render('author', {
                author: authorResult[0],
                articles: articleResult
            });
        });
    });
});

app.listen(3003, () => {
    console.log('Server is running on http://localhost:3003');
});