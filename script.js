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

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();

        // State
        let currentUser = null;
        let selectedPhotos = [];

        // Initialize
        async function init() {
            setupNavigation();
            
            // Check auth state
            auth.onAuthStateChanged((user) => {
                currentUser = user;
                if (user && document.getElementById('adminPanel').style.display === 'block') {
                    loadAdminRetiros();
                }
            });

            loadRetiros();
            loadGaleria();
        }

        // Navigation
        function setupNavigation() {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = link.dataset.section;
                    showSection(section);
                });
            });
        }

        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
        }

        // Show Alert
        function showAlert(containerId, message, type = 'success') {
            const alert = document.getElementById(containerId);
            alert.className = `alert alert-${type} active`;
            alert.textContent = message;
            setTimeout(() => {
                alert.classList.remove('active');
            }, 5000);
        }

        // Login/Logout
        async function login() {
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;

            try {
                await auth.signInWithEmailAndPassword(email, password);
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                await loadAdminRetiros();
                showAlert('adminAlert', 'Login realizado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro no login:', error);
                showAlert('loginAlert', 'Erro ao fazer login: ' + error.message, 'error');
            }
        }

        async function logout() {
            try {
                await auth.signOut();
                document.getElementById('loginForm').style.display = 'block';
                document.getElementById('adminPanel').style.display = 'none';
                document.getElementById('adminEmail').value = '';
                document.getElementById('adminPassword').value = '';
                showSection('home');
            } catch (error) {
                console.error('Erro no logout:', error);
            }
        }

        // Load Retiros (Public)
        async function loadRetiros() {
            const grid = document.getElementById('retirosGrid');
            
            try {
                const snapshot = await db.collection('retiros').orderBy('timestamp', 'desc').get();
                
                if (snapshot.empty) {
                    grid.innerHTML = '<div class="empty-state"><i class="fas fa-om"></i><p>Nenhum retiro cadastrado ainda.</p></div>';
                    return;
                }

                const retiros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                grid.innerHTML = retiros.map(retiro => `
                    <div class="retiro-card">
                        ${retiro.imagemUrl ? `<img src="${retiro.imagemUrl}" alt="${retiro.nome}" class="retiro-image">` : '<div class="retiro-image"></div>'}
                        <div class="retiro-content">
                            <h3 class="retiro-title">${retiro.nome}</h3>
                            <div class="retiro-info">
                                <i class="fas fa-calendar"></i>
                                <span>${retiro.data}</span>
                            </div>
                            <div class="retiro-info">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${retiro.local}</span>
                            </div>
                            ${retiro.edicao ? `<div class="retiro-info"><i class="fas fa-tag"></i><span>${retiro.edicao}</span></div>` : ''}
                            ${retiro.descricao ? `<p class="retiro-description">${retiro.descricao}</p>` : ''}
                            ${retiro.coords ? `<div class="map-container"><iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?q=${retiro.coords}&output=embed"></iframe></div>` : ''}
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Erro ao carregar retiros:', error);
                grid.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar retiros.</p></div>';
            }
        }

        // Load Galeria (Public)
        async function loadGaleria() {
            const container = document.getElementById('galeriaContainer');
            
            try {
                const snapshot = await db.collection('photos').get();
                
                if (snapshot.empty) {
                    container.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><p>Nenhuma foto na galeria ainda.</p></div>';
                    return;
                }

                const photosByEdicao = {};
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (!photosByEdicao[data.edicao]) {
                        photosByEdicao[data.edicao] = [];
                    }
                    photosByEdicao[data.edicao].push(data.url);
                });

                container.innerHTML = Object.entries(photosByEdicao).map(([edicao, urls]) => `
                    <div class="gallery-edition">
                        <h3>${edicao}</h3>
                        <div class="gallery-grid">
                            ${urls.map(url => `
                                <div class="gallery-item" onclick="openModal('${url}')">
                                    <img src="${url}" alt="${edicao}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Erro ao carregar galeria:', error);
                container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar galeria.</p></div>';
            }
        }

        // Load Admin Retiros
        async function loadAdminRetiros() {
            const list = document.getElementById('adminRetirosList');
            
            try {
                const snapshot = await db.collection('retiros').orderBy('timestamp', 'desc').get();
                
                if (snapshot.empty) {
                    list.innerHTML = '<p style="color: #999; text-align: center;">Nenhum retiro cadastrado.</p>';
                    return;
                }

                const retiros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                list.innerHTML = retiros.map(retiro => `
                    <div class="admin-retiro-item">
                        <div class="admin-retiro-info">
                            <h4>${retiro.nome}</h4>
                            <p style="color: #666;">${retiro.data} - ${retiro.local}</p>
                        </div>
                        <div class="admin-retiro-actions">
                            <button class="btn btn-secondary" onclick='editRetiro(${JSON.stringify(retiro).replace(/'/g, "&apos;")})'>Editar</button>
                            <button class="btn btn-danger" onclick="deleteRetiro('${retiro.id}')">Excluir</button>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Erro ao carregar retiros admin:', error);
                list.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar retiros.</p>';
            }
        }

        // Preview Retiro Image
        function previewRetiroImage(input) {
            const preview = document.getElementById('retiroImagePreview');
            
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; border-radius: 10px;">`;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Save Retiro
        async function saveRetiro(e) {
            e.preventDefault();
            
            if (!currentUser) {
                showAlert('adminAlert', 'Você precisa estar logado!', 'error');
                return;
            }

            const btn = document.getElementById('saveRetiroBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

            try {
                const id = document.getElementById('retiroId').value;
                let imagemUrl = document.getElementById('retiroImagem').value;

                // Upload image if selected
                const imageFile = document.getElementById('retiroImagemFile').files[0];
                if (imageFile) {
                    const progressBar = document.getElementById('retiroUploadProgress');
                    const progressBarFill = document.getElementById('retiroProgressBar');
                    progressBar.classList.add('active');

                    const storageRef = storage.ref(`retiros/${Date.now()}_${imageFile.name}`);
                    const uploadTask = storageRef.put(imageFile);

                    imagemUrl = await new Promise((resolve, reject) => {
                        uploadTask.on('state_changed',
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                progressBarFill.style.width = progress + '%';
                                progressBarFill.textContent = Math.round(progress) + '%';
                            },
                            (error) => reject(error),
                            async () => {
                                const url = await uploadTask.snapshot.ref.getDownloadURL();
                                progressBar.classList.remove('active');
                                resolve(url);
                            }
                        );
                    });
                }

                const retiroData = {
                    nome: document.getElementById('retiroNome').value,
                    edicao: document.getElementById('retiroEdicao').value,
                    data: document.getElementById('retiroData').value,
                    local: document.getElementById('retiroLocal').value,
                    coords: document.getElementById('retiroCoords').value,
                    descricao: document.getElementById('retiroDescricao').value,
                    imagemUrl: imagemUrl,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (id) {
                    await db.collection('retiros').doc(id).update(retiroData);
                    showAlert('adminAlert', 'Retiro atualizado com sucesso!', 'success');
                } else {
                    await db.collection('retiros').add(retiroData);
                    showAlert('adminAlert', 'Retiro criado com sucesso!', 'success');
                }

                await loadRetiros();
                await loadAdminRetiros();
                resetForm();
            } catch (error) {
                console.error('Erro ao salvar retiro:', error);
                showAlert('adminAlert', 'Erro ao salvar retiro: ' + error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Salvar Retiro';
            }
        }

        // Edit Retiro
        function editRetiro(retiro) {
            document.getElementById('retiroId').value = retiro.id;
            document.getElementById('retiroNome').value = retiro.nome;
            document.getElementById('retiroEdicao').value = retiro.edicao || '';
            document.getElementById('retiroData').value = retiro.data;
            document.getElementById('retiroLocal').value = retiro.local;
            document.getElementById('retiroCoords').value = retiro.coords || '';
            document.getElementById('retiroDescricao').value = retiro.descricao || '';
            document.getElementById('retiroImagem').value = retiro.imagemUrl || '';
            
            if (retiro.imagemUrl) {
                document.getElementById('retiroImagePreview').innerHTML = 
                    `<img src="${retiro.imagemUrl}" style="max-width: 200px; border-radius: 10px;">`;
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Delete Retiro
        async function deleteRetiro(id) {
            if (!confirm('Tem certeza que deseja excluir este retiro?')) return;

            try {
                await db.collection('retiros').doc(id).delete();
                await loadRetiros();
                await loadAdminRetiros();
                showAlert('adminAlert', 'Retiro excluído com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao excluir retiro:', error);
                showAlert('adminAlert', 'Erro ao excluir retiro: ' + error.message, 'error');
            }
        }

        // Reset Form
        function resetForm() {
            document.getElementById('retiroForm').reset();
            document.getElementById('retiroId').value = '';
            document.getElementById('retiroImagePreview').innerHTML = '';
            document.getElementById('retiroImagem').value = '';
        }

        // Preview Photos
        function previewPhotos(input) {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = '';
            selectedPhotos = [];

            if (input.files) {
                Array.from(input.files).forEach((file, index) => {
                    selectedPhotos.push(file);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const div = document.createElement('div');
                        div.className = 'photo-preview-item';
                        div.innerHTML = `
                            <img src="${e.target.result}">
                            <button onclick="removePhoto(${index})" type="button">×</button>
                        `;
                        preview.appendChild(div);
                    };
                    reader.readAsDataURL(file);
                });
            }
        }

        // Remove Photo from Preview
        function removePhoto(index) {
            selectedPhotos.splice(index, 1);
            const input = document.getElementById('photoFiles');
            const dt = new DataTransfer();
            selectedPhotos.forEach(file => dt.items.add(file));
            input.files = dt.files;
            previewPhotos(input);
        }

        // Upload Photos
        async function uploadPhotos() {
            const edicao = document.getElementById('photoEdicao').value.trim();
            
            if (!edicao) {
                showAlert('adminAlert', 'Por favor, preencha a edição do retiro!', 'error');
                return;
            }

            if (selectedPhotos.length === 0) {
                showAlert('adminAlert', 'Por favor, selecione pelo menos uma foto!', 'error');
                return;
            }

            if (!currentUser) {
                showAlert('adminAlert', 'Você precisa estar logado!', 'error');
                return;
            }

            const btn = document.getElementById('uploadPhotosBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fazendo upload...';

            const progressBar = document.getElementById('photoUploadProgress');
            const progressBarFill = document.getElementById('photoProgressBar');
            progressBar.classList.add('active');

            try {
                const totalFiles = selectedPhotos.length;
                let uploadedFiles = 0;

                for (const file of selectedPhotos) {
                    const storageRef = storage.ref(`galeria/${edicao}/${Date.now()}_${file.name}`);
                    const uploadTask = storageRef.put(file);

                    const url = await new Promise((resolve, reject) => {
                        uploadTask.on('state_changed',
                            (snapshot) => {
                                const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes);
                                const totalProgress = ((uploadedFiles + fileProgress) / totalFiles) * 100;
                                progressBarFill.style.width = totalProgress + '%';
                                progressBarFill.textContent = Math.round(totalProgress) + '%';
                            },
                            (error) => reject(error),
                            async () => {
                                const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                                resolve(downloadUrl);
                            }
                        );
                    });

                    await db.collection('photos').add({
                        edicao: edicao,
                        url: url,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    uploadedFiles++;
                }

                progressBar.classList.remove('active');
                await loadGaleria();
                
                document.getElementById('photoEdicao').value = '';
                document.getElementById('photoFiles').value = '';
                document.getElementById('photoPreview').innerHTML = '';
                selectedPhotos = [];
                
                showAlert('adminAlert', `${totalFiles} foto(s) adicionada(s) com sucesso!`, 'success');
            } catch (error) {
                console.error('Erro ao fazer upload:', error);
                showAlert('adminAlert', 'Erro ao fazer upload: ' + error.message, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Fazer Upload das Fotos';
                progressBar.classList.remove('active');
            }
        }

        // Modal
        function openModal(src) {
            document.getElementById('modalImage').src = src;
            document.getElementById('imageModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('imageModal').classList.remove('active');
        }

        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target.id === 'imageModal') {
                closeModal();
            }
        });

        // Initialize on load
        init();