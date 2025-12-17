/**
 * EXEMPLO ALTERNATIVO - Uso sem Google Maps API
 * 
 * Se você não quiser usar a API do Google Maps por questões de custo ou configuração,
 * você pode usar APIs gratuitas de geocodificação e cálculo de distância.
 * 
 * Abaixo estão algumas alternativas GRATUITAS:
 */

const AlternativeAPIs = {
    
    /**
     * OPÇÃO 1: OpenStreetMap Nominatim + Haversine
     * Totalmente gratuito, sem chave de API necessária
     * Limitação: Cálculo de distância "em linha reta", não por estrada
     */
    calculateDistanceWithOSM: async function(origin, destination) {
        try {
            // Geocodifica as duas cidades usando Nominatim
            const originCoords = await this.geocodeWithNominatim(origin);
            const destCoords = await this.geocodeWithNominatim(destination);
            
            // Calcula a distância usando a fórmula de Haversine
            const distanceKm = this.calculateHaversineDistance(
                originCoords.lat, originCoords.lon,
                destCoords.lat, destCoords.lon
            );
            
            return {
                distanceKm: Math.round(distanceKm),
                distanceText: `${Math.round(distanceKm)} km`,
                durationText: 'N/A',
                durationMinutes: 0,
                method: 'OpenStreetMap (linha reta)'
            };
            
        } catch (error) {
            console.error('Erro ao calcular distância com OSM:', error);
            throw error;
        }
    },

    /**
     * Geocodifica um endereço usando Nominatim (OpenStreetMap)
     * IMPORTANTE: Respeite os limites de uso (1 requisição por segundo)
     */
    geocodeWithNominatim: async function(address) {
        const url = `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(address)}` +
            `&format=json` +
            `&limit=1` +
            `&countrycodes=br`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Calculadora-CO2-App' // Nominatim requer User-Agent
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro na geocodificação: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error('Endereço não encontrado');
        }
        
        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
        };
    },

    /**
     * Calcula a distância entre dois pontos usando a fórmula de Haversine
     * Retorna a distância em quilômetros
     */
    calculateHaversineDistance: function(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    },

    /**
     * Converte graus para radianos
     */
    toRad: function(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * OPÇÃO 2: OpenRouteService API
     * Gratuito até 2000 requisições/dia
     * Requer cadastro gratuito: https://openrouteservice.org/dev/#/signup
     * Calcula distância por estrada (mais preciso)
     */
    calculateDistanceWithORS: async function(origin, destination, apiKey) {
        try {
            // Primeiro, geocodifica os endereços
            const originCoords = await this.geocodeWithNominatim(origin);
            const destCoords = await this.geocodeWithNominatim(destination);
            
            // Chama a API de direções do OpenRouteService
            const url = `https://api.openrouteservice.org/v2/directions/driving-car?` +
                `start=${originCoords.lon},${originCoords.lat}` +
                `&end=${destCoords.lon},${destCoords.lat}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro na API ORS: ${response.status}`);
            }
            
            const data = await response.json();
            const route = data.features[0];
            const distanceMeters = route.properties.segments[0].distance;
            const durationSeconds = route.properties.segments[0].duration;
            
            return {
                distanceKm: Math.round(distanceMeters / 1000),
                distanceText: `${Math.round(distanceMeters / 1000)} km`,
                durationText: `${Math.round(durationSeconds / 60)} min`,
                durationMinutes: Math.round(durationSeconds / 60),
                method: 'OpenRouteService (estrada)'
            };
            
        } catch (error) {
            console.error('Erro ao calcular distância com ORS:', error);
            throw error;
        }
    },

    /**
     * OPÇÃO 3: Mapbox Directions API
     * Gratuito até 100.000 requisições/mês
     * Requer cadastro: https://account.mapbox.com/auth/signup/
     */
    calculateDistanceWithMapbox: async function(origin, destination, accessToken) {
        try {
            // Geocodifica os endereços
            const originCoords = await this.geocodeWithNominatim(origin);
            const destCoords = await this.geocodeWithNominatim(destination);
            
            // Chama a API de direções do Mapbox
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/` +
                `${originCoords.lon},${originCoords.lat};` +
                `${destCoords.lon},${destCoords.lat}?` +
                `access_token=${accessToken}&` +
                `geometries=geojson`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro na API Mapbox: ${response.status}`);
            }
            
            const data = await response.json();
            const route = data.routes[0];
            
            return {
                distanceKm: Math.round(route.distance / 1000),
                distanceText: `${Math.round(route.distance / 1000)} km`,
                durationText: `${Math.round(route.duration / 60)} min`,
                durationMinutes: Math.round(route.duration / 60),
                method: 'Mapbox (estrada)'
            };
            
        } catch (error) {
            console.error('Erro ao calcular distância com Mapbox:', error);
            throw error;
        }
    },

    /**
     * OPÇÃO 4: API do BingMaps
     * Gratuito até 125.000 transações/ano
     * Requer cadastro: https://www.bingmapsportal.com/
     */
    calculateDistanceWithBing: async function(origin, destination, apiKey) {
        try {
            const url = `https://dev.virtualearth.net/REST/v1/Routes/Driving?` +
                `wp.0=${encodeURIComponent(origin)}&` +
                `wp.1=${encodeURIComponent(destination)}&` +
                `key=${apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro na API Bing: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.resourceSets[0].resources.length === 0) {
                throw new Error('Rota não encontrada');
            }
            
            const route = data.resourceSets[0].resources[0];
            const distanceKm = route.travelDistance;
            const durationSeconds = route.travelDuration;
            
            return {
                distanceKm: Math.round(distanceKm),
                distanceText: `${Math.round(distanceKm)} km`,
                durationText: `${Math.round(durationSeconds / 60)} min`,
                durationMinutes: Math.round(durationSeconds / 60),
                method: 'Bing Maps (estrada)'
            };
            
        } catch (error) {
            console.error('Erro ao calcular distância com Bing:', error);
            throw error;
        }
    },

    /**
     * 🆕 Busca cidades em tempo real usando OpenStreetMap Nominatim
     * Para autocomplete dinâmico
     * @param {string} query - Texto digitado pelo usuário
     * @param {string} countryCode - Código do país (ex: 'br', 'us', 'fr')
     * @param {number} limit - Número máximo de resultados (padrão: 5)
     * @returns {Promise<Array>} Array de cidades encontradas
     */
    searchCities: async function(query, countryCode = 'br', limit = 5) {
        try {
            // Não busca se o texto for muito curto
            if (!query || query.length < 2) {
                return [];
            }

            // Construa a URL da API Nominatim para busca
            // Procura por cidades, vilas, municípios, etc.
            const url = `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}` +
                `&countrycodes=${countryCode}` +
                `&format=json` +
                `&addressdetails=1` +
                `&limit=${limit}` +
                `&featuretype=city` +
                `&accept-language=pt-BR`;

            console.log(`🔍 Buscando cidades: "${query}" (${countryCode.toUpperCase()})`);

            // Faz a requisição
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'CarbonCalculator/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();

            // Processa os resultados
            const cities = data.map(place => {
                // Extrai informações do endereço
                const address = place.address || {};
                const cityName = address.city || address.town || address.village || address.municipality || place.display_name.split(',')[0];
                
                // Mapeamento de estados brasileiros para siglas
                const stateMap = {
                    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
                    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
                    'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
                    'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
                    'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE',
                    'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
                    'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR',
                    'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
                };

                // Nome do estado (completo ou sigla)
                let stateName = address.state || '';
                const stateAbbr = stateMap[stateName] || stateName;

                // Formata o nome da cidade
                let formattedName = cityName;
                if (stateAbbr) {
                    formattedName = `${cityName}, ${stateAbbr}`;
                } else if (address.country) {
                    // Para cidades internacionais
                    formattedName = `${cityName}, ${address.country}`;
                }

                return {
                    name: formattedName,
                    fullName: place.display_name,
                    lat: place.lat,
                    lon: place.lon,
                    type: place.type || 'cidade',
                    importance: place.importance || 0
                };
            });

            // Ordena por importância (maiores cidades primeiro)
            cities.sort((a, b) => b.importance - a.importance);

            console.log(`✅ Encontradas ${cities.length} cidades`);
            
            return cities;

        } catch (error) {
            console.error('❌ Erro ao buscar cidades:', error);
            throw error;
        }
    }
};

/**
 * COMPARAÇÃO DAS ALTERNATIVAS:
 * 
 * ┌─────────────────┬──────────────┬─────────────────┬───────────────┬─────────────────┐
 * │ API             │ Grátis?      │ Limite Gratuito │ Precisão      │ Requer Cadastro │
 * ├─────────────────┼──────────────┼─────────────────┼───────────────┼─────────────────┤
 * │ Google Maps     │ $200/mês     │ ~40k req/mês    │ ★★★★★         │ Sim + Cartão    │
 * │ OpenStreetMap   │ Sim          │ Ilimitado*      │ ★★★ (linha)   │ Não             │
 * │ OpenRouteService│ Sim          │ 2000 req/dia    │ ★★★★          │ Sim             │
 * │ Mapbox          │ Sim          │ 100k req/mês    │ ★★★★★         │ Sim             │
 * │ Bing Maps       │ Sim          │ 125k req/ano    │ ★★★★          │ Sim             │
 * └─────────────────┴──────────────┴─────────────────┴───────────────┴─────────────────┘
 * 
 * * OpenStreetMap Nominatim: Limite de 1 requisição por segundo
 * 
 * RECOMENDAÇÃO:
 * - Para projetos pessoais/estudo: OpenStreetMap (grátis, sem cadastro)
 * - Para projetos profissionais: Mapbox ou Google Maps
 * - Para protótipos rápidos: OpenRouteService
 */

/**
 * EXEMPLO DE USO:
 * 
 * // Usar OpenStreetMap (sem API key necessária)
 * AlternativeAPIs.calculateDistanceWithOSM('São Paulo, SP', 'Rio de Janeiro, RJ')
 *     .then(result => console.log(result))
 *     .catch(error => console.error(error));
 * 
 * // Usar OpenRouteService (requer API key gratuita)
 * const orsApiKey = 'SUA_CHAVE_ORS_AQUI';
 * AlternativeAPIs.calculateDistanceWithORS('São Paulo, SP', 'Rio de Janeiro, RJ', orsApiKey)
 *     .then(result => console.log(result))
 *     .catch(error => console.error(error));
 * 
 * // Usar Mapbox (requer token gratuito)
 * const mapboxToken = 'SUA_CHAVE_MAPBOX_AQUI';
 * AlternativeAPIs.calculateDistanceWithMapbox('São Paulo, SP', 'Rio de Janeiro, RJ', mapboxToken)
 *     .then(result => console.log(result))
 *     .catch(error => console.error(error));
 * 
 * // Buscar cidades para autocomplete
 * AlternativeAPIs.searchCities('Reci', 'br', 5)
 *     .then(cities => console.log(cities))
 *     .catch(error => console.error(error));
 */
