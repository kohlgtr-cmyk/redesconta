# 🔥 GUIA DE CONFIGURAÇÃO - (RE)DESCONECTA COM FIREBASE REALTIME DATABASE

## 📋 CHECKLIST RÁPIDO

- [ ] Criar conta no Firebase
- [ ] Criar projeto no Firebase Console
- [ ] Ativar Realtime Database
- [ ] Ativar Storage
- [ ] Ativar Authentication (Email/Senha)
- [ ] Criar usuário admin
- [ ] Copiar credenciais do Firebase (incluindo databaseURL)
- [ ] Substituir no arquivo HTML
- [ ] Configurar regras de segurança
- [ ] Testar o site

---

## 🚀 PASSO A PASSO DETALHADO

### 1. CRIAR CONTA E PROJETO NO FIREBASE

1. Acesse: https://console.firebase.google.com
2. Faça login com sua conta Google
3. Clique em **"Adicionar projeto"** (ou "Create a project")
4. Nome do projeto: `redesconecta` (ou o nome que preferir)
5. Desmarque "Ativar Google Analytics" (não é necessário)
6. Clique em **"Criar projeto"**
7. Aguarde a criação (leva alguns segundos)

---

### 2. ATIVAR REALTIME DATABASE

1. No menu lateral esquerdo, clique em **"Realtime Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha a localização: **"United States (us-central1)"** (é a única opção gratuita)
4. Selecione **"Iniciar no modo bloqueado"** (vamos configurar as regras depois)
5. Clique em **"Ativar"**

#### 2.1 CONFIGURAR REGRAS DO REALTIME DATABASE

1. Após criar, clique na aba **"Regras"**
2. Você vai ver um JSON. Apague tudo e cole isso:

```json
{
  "rules": {
    "retiros": {
      ".read": true,
      ".write": "auth != null"
    },
    "photos": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

3. Clique em **"Publicar"**

**⚠️ IMPORTANTE:** Copie a URL do banco de dados que aparece no topo (algo como `https://redesconecta-12345-default-rtdb.firebaseio.com`). Você vai precisar dela!

---

### 3. ATIVAR STORAGE (PARA IMAGENS)

1. No menu lateral esquerdo, clique em **"Storage"**
2. Clique em **"Começar"**
3. Clique em **"Avançar"** (mantenha as regras padrão por enquanto)
4. Escolha a mesma localização: **"southamerica-east1"**
5. Clique em **"Concluído"**

#### 3.1 CONFIGURAR REGRAS DO STORAGE

1. Clique na aba **"Regras"**
2. Apague tudo e cole isso:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Qualquer um pode ler imagens
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Só admin autenticado pode fazer upload
    match /retiros/{allPaths=**} {
      allow write: if request.auth != null;
    }
    
    match /galeria/{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

3. Clique em **"Publicar"**

---

### 4. ATIVAR AUTHENTICATION (LOGIN)

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Clique na aba **"Sign-in method"**
4. Clique em **"E-mail/senha"**
5. Ative a primeira opção: **"E-mail/senha"**
6. Clique em **"Salvar"**

#### 4.1 CRIAR USUÁRIO ADMIN

1. Clique na aba **"Users"**
2. Clique em **"Adicionar usuário"**
3. E-mail: `admin@redesconecta.com` (ou o que você preferir)
4. Senha: crie uma senha FORTE (ex: `Rede$2025!Strong`)
5. Clique em **"Adicionar usuário"**

⚠️ **IMPORTANTE:** Guarde esse e-mail e senha! Você vai usar para fazer login no site.

---

### 5. PEGAR AS CREDENCIAIS DO FIREBASE

1. Clique no ícone de **⚙️ engrenagem** ao lado de "Visão geral do projeto" (topo esquerdo)
2. Clique em **"Configurações do projeto"**
3. Role a página até **"Seus apps"**
4. Clique no ícone **"Web" (</>)** (é um símbolo parecido com `</>`)
5. Dê um apelido: `redesconecta-site`
6. **NÃO** marque "Firebase Hosting" (não é necessário)
7. Clique em **"Registrar app"**
8. Copie o objeto **firebaseConfig** que aparece

Vai ser algo parecido com isso:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABC123def456GHI789jkl",
  authDomain: "redesconecta-12345.firebaseapp.com",
  projectId: "redesconecta-12345",
  databaseURL: "https://redesconecta-12345-default-rtdb.firebaseio.com",
  storageBucket: "redesconecta-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

**⚠️ ATENÇÃO:** A `databaseURL` você copia lá da tela do Realtime Database (é a URL que aparece no topo)!

---

### 6. CONFIGURAR O ARQUIVO HTML

1. Abra o arquivo **redesconecta-realtime.html**
2. Procure por esta seção (está no começo do JavaScript):

```javascript
// ========================================
// CONFIGURAÇÃO DO FIREBASE
// SUBSTITUA COM SUAS CREDENCIAIS
// ========================================
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJECT_ID.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    databaseURL: "https://SEU_PROJECT_ID-default-rtdb.firebaseio.com",
    storageBucket: "SEU_PROJECT_ID.appspot.com",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

3. **SUBSTITUA** pelos valores que você copiou do Firebase (incluindo a `databaseURL`)
4. Salve o arquivo

**EXEMPLO DE COMO FICA:**

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyABC123def456GHI789jkl",
    authDomain: "redesconecta-12345.firebaseapp.com",
    projectId: "redesconecta-12345",
    databaseURL: "https://redesconecta-12345-default-rtdb.firebaseio.com",
    storageBucket: "redesconecta-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456"
};
```

```javascript
// ========================================
// CONFIGURAÇÃO DO FIREBASE
// SUBSTITUA COM SUAS CREDENCIAIS
// ========================================
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJECT_ID.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJECT_ID.appspot.com",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

---

### 7. TESTAR O SITE

1. Abra o arquivo **redesconecta-realtime.html** no navegador
2. Clique em **"Admin"** no menu
3. Faça login com o e-mail e senha que você criou
4. Teste adicionar um retiro
5. Teste fazer upload de uma foto

Se tudo funcionar, os dados vão aparecer para qualquer pessoa que acessar o site! 🎉

---

## 🎯 COMO USAR O SITE

### ADICIONAR UM RETIRO:

1. Faça login no Admin
2. Preencha o formulário:
   - Nome do Retiro
   - Edição (ex: "1ª Edição - Verão 2025")
   - Data e Horário
   - Localização
   - Coordenadas do Maps (opcional)
   - Descrição
   - Imagem (escolha do seu computador)
3. Clique em "Salvar Retiro"

### ADICIONAR FOTOS À GALERIA:

1. Faça login no Admin
2. Role até "Adicionar Fotos à Galeria"
3. Digite a edição do retiro (ex: "1ª Edição - Verão 2025")
4. Clique em "Escolher Fotos" e selecione múltiplas fotos
5. Clique em "Fazer Upload das Fotos"

### EDITAR UM RETIRO:

1. Role até "Retiros Cadastrados"
2. Clique em "Editar" no retiro desejado
3. Modifique o que quiser
4. Clique em "Salvar Retiro"

### EXCLUIR UM RETIRO:

1. Role até "Retiros Cadastrados"
2. Clique em "Excluir" no retiro desejado
3. Confirme a exclusão

---

## 📱 HOSPEDAGEM DO SITE

Depois de configurar, você pode hospedar o site de várias formas:

### OPÇÃO 1: Firebase Hosting (RECOMENDADO - GRÁTIS)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### OPÇÃO 2: Netlify (GRÁTIS)
1. Acesse netlify.com
2. Arraste o arquivo HTML
3. Pronto!

### OPÇÃO 3: GitHub Pages (GRÁTIS)
1. Crie um repositório no GitHub
2. Faça upload do arquivo
3. Ative GitHub Pages nas configurações

---

## ⚠️ PROBLEMAS COMUNS

### "Erro ao fazer login"
- Verifique se o e-mail e senha estão corretos
- Confirme que criou o usuário no Authentication

### "Erro ao carregar retiros"
- Verifique se as credenciais do Firebase estão corretas
- Confirme que o Firestore está ativado

### "Erro ao fazer upload"
- Verifique se o Storage está ativado
- Confirme que as regras de segurança estão corretas

### "Nada aparece no site"
- Abra o console do navegador (F12) e veja os erros
- Verifique se as credenciais do Firebase foram substituídas

---

## 💰 CUSTOS

O Firebase tem um plano GRATUITO muito generoso:

- **Realtime Database:** 1GB armazenamento + 10GB download/mês GRÁTIS
- **Storage:** 5GB GRÁTIS
- **Authentication:** Ilimitado GRÁTIS

Para um site de retiros, você provavelmente nunca vai pagar nada! 

Só vai ter custos se tiver MILHARES de visitantes por dia.

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Verifique o console do navegador (F12 > Console)
2. Confira se seguiu todos os passos
3. Revise as credenciais do Firebase

---

## ✅ VANTAGENS DO FIREBASE

✅ Dados sincronizados em TODOS os navegadores e dispositivos
✅ Upload de imagens direto no site (sem precisar de links externos)
✅ Backup automático na nuvem
✅ Rápido e confiável
✅ Grátis para pequenos/médios sites
✅ Não precisa programar backend

---

Boa sorte! 🚀🧘‍♀️



https://console.firebase.google.com/u/2/project/redesconta-4efcf/database/redesconta-4efcf-default-rtdb/