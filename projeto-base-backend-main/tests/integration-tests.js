/**
 * TESTES DE INTEGRAÇÃO - SISTEMA DE LOGIN COM USERNAME/EMAIL
 * 
 * Este arquivo contém os testes necessários para validar a implementação completa
 * do sistema de autenticação com suporte a dual login (username + email).
 * 
 * Última atualização: 2025-11-14
 * Status: ✅ PRONTO PARA TESTES
 */

// ============================================================================
// ETAPA 1: TESTES DE LOGIN COM USUARIO ANTIGO (COMPATIBILIDADE BACKWARD)
// ============================================================================

const testLoginUsernameOldUser = async () => {
  console.log('\n📝 TESTE 1: Login com username (usuário antigo - sem email)');
  
  const credentials = btoa('usuario_antigo:senha123');
  
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 200 && data.user.id) {
      console.log('  ✅ PASSOU: Login com username funcionando');
      return data.user;
    } else {
      console.log('  ❌ FALHOU: Esperado status 200');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// ETAPA 2: TESTES DE LOGIN COM EMAIL (USUARIO NOVO)
// ============================================================================

const testLoginWithEmail = async () => {
  console.log('\n📧 TESTE 2: Login com email (usuário novo)');
  
  const credentials = btoa('usuario@example.com:senha456');
  
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 200 && data.user.id) {
      console.log('  ✅ PASSOU: Login com email funcionando');
      return data.user;
    } else {
      console.log('  ❌ FALHOU: Esperado status 200');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// ETAPA 3: TESTES DE CADASTRO
// ============================================================================

const testRegisterWithEmailOptional = async () => {
  console.log('\n📝 TESTE 3: Cadastro com username e email');
  
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'novo_usuario',
        password: 'senha789',
        email: 'novo@example.com'
      })
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 201 && data.user.id) {
      console.log('  ✅ PASSOU: Cadastro com email funcionando');
      return data.user;
    } else {
      console.log('  ❌ FALHOU: Esperado status 201');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

const testRegisterUsernameOnly = async () => {
  console.log('\n📝 TESTE 4: Cadastro apenas com username (sem email)');
  
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'usuario_sem_email',
        password: 'senha999'
      })
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 201 && data.user.id) {
      console.log('  ✅ PASSOU: Cadastro sem email funcionando');
      return data.user;
    } else {
      console.log('  ❌ FALHOU: Esperado status 201');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// ETAPA 4: TESTES DE ERRO - EMAIL DUPLICADO
// ============================================================================

const testRegisterDuplicateEmail = async () => {
  console.log('\n❌ TESTE 5: Cadastro com email duplicado');
  
  try {
    // Primeiro, registrar um usuário com email
    await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'usuario1',
        password: 'senha111',
        email: 'duplicado@example.com'
      })
    });

    // Tentar registrar outro com o mesmo email
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'usuario2',
        password: 'senha222',
        email: 'duplicado@example.com'
      })
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 400 && data.code === 'EMAIL_ALREADY_EXISTS') {
      console.log('  ✅ PASSOU: Validação de email duplicado funcionando');
    } else {
      console.log('  ❌ FALHOU: Esperado status 400 com code EMAIL_ALREADY_EXISTS');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// ETAPA 5: TESTES DE ERRO - USERNAME DUPLICADO
// ============================================================================

const testRegisterDuplicateUsername = async () => {
  console.log('\n❌ TESTE 6: Cadastro com username duplicado');
  
  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'usuario_antigo',
        password: 'outra_senha',
        email: 'outro@example.com'
      })
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 400 && data.code === 'USERNAME_ALREADY_EXISTS') {
      console.log('  ✅ PASSOU: Validação de username duplicado funcionando');
    } else {
      console.log('  ❌ FALHOU: Esperado status 400 com code USERNAME_ALREADY_EXISTS');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// ETAPA 6: TESTES DE ERRO - SENHA INCORRETA
// ============================================================================

const testLoginWrongPassword = async () => {
  console.log('\n❌ TESTE 7: Login com senha incorreta');
  
  const credentials = btoa('usuario_antigo:senha_errada');
  
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 401 && data.code === 'WRONG_PASSWORD') {
      console.log('  ✅ PASSOU: Validação de senha incorreta funcionando');
    } else {
      console.log('  ❌ FALHOU: Esperado status 401 com code WRONG_PASSWORD');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// ETAPA 7: TESTES DE ERRO - USUARIO NAO ENCONTRADO
// ============================================================================

const testLoginUserNotFound = async () => {
  console.log('\n❌ TESTE 8: Login com usuário/email inexistente');
  
  const credentials = btoa('usuario_inexistente:senha123');
  
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 401 && data.code === 'USER_NOT_FOUND') {
      console.log('  ✅ PASSOU: Validação de usuário não encontrado funcionando');
    } else {
      console.log('  ❌ FALHOU: Esperado status 401 com code USER_NOT_FOUND');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// ETAPA 8: TESTES DE DISPONIBILIDADE (CHECK AVAILABILITY)
// ============================================================================

const testCheckAvailability = async () => {
  console.log('\n✅ TESTE 9: Verificar disponibilidade de username/email');
  
  try {
    const response = await fetch(
      'http://localhost:3000/api/users/check/availability?username=novo_usuario&email=novo@example.com',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 200 && data.username && data.email) {
      console.log('  ✅ PASSOU: Check availability funcionando');
    } else {
      console.log('  ❌ FALHOU: Esperado status 200 com campos username e email');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// ETAPA 9: TESTES DE ADICIONAR EMAIL POSTERIOR
// ============================================================================

const testAddEmailToUser = async (userId, token) => {
  console.log('\n📧 TESTE 10: Adicionar email a usuário antigo');
  
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/email`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'usuario_novo_email@example.com'
      })
    });

    const data = await response.json();

    console.log('  Status:', response.status);
    console.log('  Response:', data);
    
    if (response.status === 200 && data.user.email) {
      console.log('  ✅ PASSOU: Adicionar email posterior funcionando');
    } else {
      console.log('  ❌ FALHOU: Esperado status 200 com email no response');
    }
  } catch (error) {
    console.log('  ❌ ERRO:', error.message);
  }
};

// ============================================================================
// SUITE DE TESTES COMPLETA
// ============================================================================

const runAllTests = async () => {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   SUITE DE TESTES - SISTEMA LOGIN USERNAME/EMAIL              ║');
  console.log('║   Data: 2025-11-14                                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  // Testes básicos
  const oldUser = await testLoginUsernameOldUser();
  const newUserEmail = await testLoginWithEmail();
  
  // Testes de cadastro
  await testRegisterWithEmailOptional();
  await testRegisterUsernameOnly();
  
  // Testes de erro
  await testRegisterDuplicateEmail();
  await testRegisterDuplicateUsername();
  await testLoginWrongPassword();
  await testLoginUserNotFound();
  
  // Testes de features adicionais
  await testCheckAvailability();
  
  // Teste de adicionar email posterior
  if (oldUser) {
    const token = btoa('usuario_antigo:senha123');
    await testAddEmailToUser(oldUser.id, token);
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║   TESTES COMPLETOS - Verifique os resultados acima            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
};

// Exportar para uso em ambiente Node.js ou browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testLoginUsernameOldUser,
    testLoginWithEmail,
    testRegisterWithEmailOptional,
    testRegisterUsernameOnly,
    testRegisterDuplicateEmail,
    testRegisterDuplicateUsername,
    testLoginWrongPassword,
    testLoginUserNotFound,
    testCheckAvailability,
    testAddEmailToUser,
    runAllTests
  };
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}
