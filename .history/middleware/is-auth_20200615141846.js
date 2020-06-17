module.exports = (req, res, next) => {
    console.log(req.session.isLoggedIn, "is_Auth");
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}