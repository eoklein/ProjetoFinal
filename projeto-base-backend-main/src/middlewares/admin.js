const adminMiddleware = (req, res, next) => {
  console.log(' Verificando admin', req.user.username, 'isAdmin:', req.user.isAdmin);
  
  if (req.user.isAdmin !== true) {
    console.log(' ACESSO NEGADO para:', req.user.username);
    return res.status(403).json({ 
      error: 'Acesso negado. Permissão de administrador necessária.' 
    });
  }
  
  console.log(' ACESSO PERMITIDO para admin:', req.user.username);
  next();
};

module.exports = adminMiddleware;