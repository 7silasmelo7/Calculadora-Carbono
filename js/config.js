/**
 * CONFIG -Objeto de configuração global
 * Contém fatores de emissão, metadados de modo de transporte e funções de utilidade
 */

const CONFIG = {
    /**
     * Fatores de emissão de CO2 em kg por quilómetro para cada modo de transporte
     */
    EMISSION_FACTORS: {
        bicycle: 0,
        car: 0.12,
        bus: 0.089,
        truck: 0.96
    },

    /**
     * Metadados do modo de transporte para renderização da IU
     */
    TRANSPORT_MODES: {
        bicycle: {
            label: "Bicicleta",
            icon: "🚲",
            color: "#10b981"
        },
        car: {
            label: "Carro",
            icon: "🚗",
            color: "#3b82f6"
        },
        bus: {
            label: "Ônibus",
            icon: "🚌",
            color: "#f59e0b"
        },
        truck: {
            label: "Caminhão",
            icon: "🚚",
            color: "#ef4444"
        }
    },

    /**
     * Configuração de crédito de carbono
     */
    CARBON_CREDIT: {
        KG_PER_CREDIT: 1000,
        PRICE_MIN_BRL: 50,
        PRICE_MAX_BRL: 150
    },

    /**
     * Preencha a lista de dados com cidades brasileiras comuns
     * Agora com autocomplete dinâmico do OpenStreetMap
     */
    populateDatalist: function() {
        // Função obsoleta - agora usamos autocomplete dinâmico
        // Mantida por compatibilidade
        console.log('📍 Autocomplete dinâmico ativado - buscando cidades do OpenStreetMap');
    },

    /**
     * 🆕 Configura o autocomplete dinâmico para buscar cidades do OpenStreetMap
     */
    setupDynamicAutocomplete: function() {
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        const originSuggestions = document.getElementById('origin-suggestions');
        const destinationSuggestions = document.getElementById('destination-suggestions');

        // Variável para controlar o debounce
        let searchTimeout = null;

        /**
         * Função para buscar e exibir sugestões
         */
        const handleSearch = async (input, suggestionsDiv) => {
            const query = input.value.trim();

            // Limpa timeout anterior
            clearTimeout(searchTimeout);

            // Se o campo está vazio, esconde sugestões
            if (query.length < 2) {
                suggestionsDiv.classList.remove('show');
                suggestionsDiv.innerHTML = '';
                return;
            }

            // Mostra loading
            suggestionsDiv.classList.add('show');
            suggestionsDiv.innerHTML = '<div class="autocomplete-loading">🔍 Buscando cidades...</div>';

            // Aguarda 300ms antes de buscar (debounce)
            searchTimeout = setTimeout(async () => {
                try {
                    // Busca cidades no OpenStreetMap
                    const cities = await AlternativeAPIs.searchCities(query, 'br', 8);

                    // Se não encontrou resultados
                    if (cities.length === 0) {
                        suggestionsDiv.innerHTML = '<div class="autocomplete-no-results">Nenhuma cidade encontrada</div>';
                        return;
                    }

                    // Cria HTML das sugestões
                    const suggestionsHTML = cities.map(city => `
                        <div class="autocomplete-suggestion" data-name="${city.name}">
                            <span class="autocomplete-suggestion-name">${city.name}</span>
                            <span class="autocomplete-suggestion-details">${city.type || 'cidade'}</span>
                        </div>
                    `).join('');

                    suggestionsDiv.innerHTML = suggestionsHTML;

                    // Adiciona eventos de clique
                    const suggestions = suggestionsDiv.querySelectorAll('.autocomplete-suggestion');
                    suggestions.forEach(suggestion => {
                        suggestion.addEventListener('click', () => {
                            input.value = suggestion.dataset.name;
                            suggestionsDiv.classList.remove('show');
                            suggestionsDiv.innerHTML = '';
                            
                            // Dispara evento de mudança para calcular distância
                            input.dispatchEvent(new Event('change'));
                        });
                    });

                } catch (error) {
                    console.error('Erro ao buscar cidades:', error);
                    suggestionsDiv.innerHTML = '<div class="autocomplete-no-results">Erro ao buscar cidades</div>';
                }
            }, 300);
        };

        // Adiciona eventos de input nos campos
        originInput.addEventListener('input', () => handleSearch(originInput, originSuggestions));
        destinationInput.addEventListener('input', () => handleSearch(destinationInput, destinationSuggestions));

        // Fecha sugestões ao clicar fora
        document.addEventListener('click', (e) => {
            if (!originInput.contains(e.target) && !originSuggestions.contains(e.target)) {
                originSuggestions.classList.remove('show');
            }
            if (!destinationInput.contains(e.target) && !destinationSuggestions.contains(e.target)) {
                destinationSuggestions.classList.remove('show');
            }
        });

        // Navegação com teclado (setas e Enter)
        [originInput, destinationInput].forEach(input => {
            const suggestionsDiv = input.id === 'origin' ? originSuggestions : destinationSuggestions;
            
            input.addEventListener('keydown', (e) => {
                const suggestions = suggestionsDiv.querySelectorAll('.autocomplete-suggestion');
                const active = suggestionsDiv.querySelector('.autocomplete-suggestion.active');
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!active) {
                        suggestions[0]?.classList.add('active');
                    } else {
                        active.classList.remove('active');
                        const next = active.nextElementSibling;
                        if (next) next.classList.add('active');
                        else suggestions[0]?.classList.add('active');
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (!active) {
                        suggestions[suggestions.length - 1]?.classList.add('active');
                    } else {
                        active.classList.remove('active');
                        const prev = active.previousElementSibling;
                        if (prev) prev.classList.add('active');
                        else suggestions[suggestions.length - 1]?.classList.add('active');
                    }
                } else if (e.key === 'Enter' && active) {
                    e.preventDefault();
                    active.click();
                } else if (e.key === 'Escape') {
                    suggestionsDiv.classList.remove('show');
                }
            });
        });

        console.log('✅ Autocomplete dinâmico configurado!');
    },

    /**
     * Configurar cálculo automático de distância usando APENAS OpenStreetMap
     * Sistema simplificado - 100% gratuito e sem configuração necessária
     */
    setupDistanceAutofill: function() {
        // Obtém elementos do formulário
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        const distanceInput = document.getElementById('distance');
        const manualCheckbox = document.getElementById('manual-distance');
        const helperText = document.querySelector('.form-group__helper-text');
        
        /**
         * Calcula a distância usando OpenStreetMap
         * Sistema simplificado e direto
         */
        const tryFindDistance = async () => {
            // Obtém valores dos inputs
            const origin = originInput.value.trim();
            const destination = destinationInput.value.trim();
            
            // Só procura se ambos os campos estiverem preenchidos
            if (origin && destination) {
                // Mostra mensagem de carregamento
                if (helperText) {
                    helperText.textContent = '🔍 Calculando distância via OpenStreetMap...';
                    helperText.style.color = '#3b82f6';
                }
                
                // Desabilita o campo de distância enquanto calcula
                distanceInput.disabled = true;
                
                try {
                    // Verifica se a API está disponível
                    if (typeof AlternativeAPIs === 'undefined') {
                        throw new Error('API do OpenStreetMap não carregada');
                    }
                    
                    // Calcula a distância usando OpenStreetMap
                    const result = await AlternativeAPIs.calculateDistanceWithOSM(origin, destination);
                    
                    // Preenche a distância calculada
                    distanceInput.value = result.distanceKm;
                    distanceInput.readOnly = true;
                    distanceInput.disabled = false;
                    
                    // Mostra mensagem de sucesso
                    if (helperText) {
                        helperText.textContent = `✅ Distância: ${result.distanceKm} km (via OpenStreetMap)`;
                        helperText.style.color = '#10b981';
                    }
                    
                    console.log('🗺️ Distância calculada:', result);
                    
                } catch (error) {
                    // Erro ao calcular
                    console.error('Erro ao calcular distância:', error);
                    
                    distanceInput.value = '';
                    distanceInput.readOnly = false;
                    distanceInput.disabled = false;
                    
                    if (helperText) {
                        helperText.textContent = '⚠️ Não foi possível calcular. Use o formato "Cidade, Estado" ou insira manualmente.';
                        helperText.style.color = '#ef4444';
                    }
                }
            }
        };
        
        // Adiciona mudança na entrada do evento de origem e destino
        originInput.addEventListener('change', tryFindDistance);
        destinationInput.addEventListener('change', tryFindDistance);
        
        // Lidar manualmente com a caixa de seleção de distância 
        manualCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Habilita entrada manual de distância
                distanceInput.readOnly = false;
                distanceInput.focus();
                
                if (helperText) {
                    helperText.textContent = 'Digite a distância manualmente';
                    helperText.style.color = '#6b7280';
                }
            } else {
                // Tente encontrar a rota novamente ao desmarcar
                tryFindDistance();
            }
        });
    },

    /**
     * Inicialização geral do aplicativo
     */
    initialize: function() {
        console.log('🚀 Inicializando Calculadora de Carbono...');
        
        // Configurar autocomplete dinâmico do OpenStreetMap
        this.setupDynamicAutocomplete();
        
        // Configurar cálculo automático de distâncias
        this.setupDistanceAutofill();
        
        console.log('✅ Calculadora de Carbono inicializada!');
        console.log('ℹ️ Usando apenas OpenStreetMap para distâncias e cidades');
    }
};