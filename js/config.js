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
     * Preencha a lista de dados com todas as cidades disponíveis
     * Busca cidades do RoutesDB e cria elementos de opção
     */
    populateDatalist: function() {
        // Obtém o banco de dados de rotas de todas as cidades
        const cities = RoutesDB.getAllCities();
        
        // Obtém o elemento datalist
        const datalist = document.getElementById('cities-list');
        
        // Limpar opções existentes (se houver)
        datalist.innerHTML = '';
        
        // Criar e anexar elementos de opção para cada cidade
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            datalist.appendChild(option);
        });
    },

    /**
     * Configurar cálculo automático de distância quando origem e destino são selecionados
     * Lida com busca de rota e substituição manual da distância
     */
    setupDistanceAutofill: function() {
        // Obtém elementos do formulário
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        const distanceInput = document.getElementById('distance');
        const manualCheckbox = document.getElementById('manual-distance');
        const helperText = document.querySelector('.form-group__helper-text');
        
        /**
         * Tenta encontrar e preencher a distância entre as cidades selecionadas
         */
        const tryFindDistance = () => {
            // Get trimmed values from inputs
            const origin = originInput.value.trim();
            const destination = destinationInput.value.trim();
            
            // Só procura se ambos os campos estiverem preenchidos
            if (origin && destination) {
                // Tenta encontrar a distância da rota
                const distance = RoutesDB.findDistance(origin, destination);
                
                if (distance !== null) {
                    // Rota encontrada - preencha a distância
                    distanceInput.value = distance;
                    distanceInput.readOnly = true;
                    
                    // Mostra a mensagem de sucesso
                    if (helperText) {
                        helperText.textContent = `✓ Distância encontrada: ${distance} km`;
                        helperText.style.color = '#10b981';
                    }
                } else {
                    // Rota não encontrada
                    distanceInput.value = '';
                    distanceInput.readOnly = false;
                    
                    // Sugere entrada manual
                    if (helperText) {
                        helperText.textContent = 'Rota não encontrada. Por favor, insira a distância manualmente.';
                        helperText.style.color = '#f59e0b';
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
    }
};