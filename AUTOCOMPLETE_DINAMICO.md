# 🔍 Autocomplete Dinâmico com OpenStreetMap

## ✨ Funcionalidade Implementada

O sistema agora possui **autocomplete dinâmico** nos campos de Origem e Destino, buscando cidades diretamente do **OpenStreetMap** em tempo real!

## 🎯 Como Funciona

### 1. **Busca em Tempo Real**
- Quando você digita nos campos de Origem/Destino, o sistema busca automaticamente cidades no OpenStreetMap
- Mostra até 8 sugestões de cidades brasileiras

### 2. **Debounce Inteligente**
- Aguarda 300ms após você parar de digitar antes de buscar
- Evita fazer muitas requisições desnecessárias
- Respeita o limite de 1 requisição/segundo do Nominatim

### 3. **Formatação Brasileira**
- Exibe cidades com estado abreviado: **"Recife, PE"**
- Mostra tipo de localidade: **cidade, município, vila**
- Exibe detalhes completos ao passar o mouse

### 4. **Navegação Facilitada**

#### **Com o Mouse:**
- 🖱️ Clique na cidade desejada para selecioná-la

#### **Com o Teclado:**
- ⬇️ **Seta para baixo**: Move para próxima sugestão
- ⬆️ **Seta para cima**: Move para sugestão anterior
- ↩️ **Enter**: Seleciona a sugestão ativa
- ⎋ **Escape**: Fecha as sugestões

## 📊 Fluxo de Uso

```
1. Usuário digita "Rec" no campo Origem
   ↓
2. Sistema aguarda 300ms (debounce)
   ↓
3. Busca "Rec" no OpenStreetMap
   ↓
4. Mostra sugestões:
   - Recife, PE
   - Recanto das Emas, DF
   - Recreio, MG
   - etc...
   ↓
5. Usuário seleciona "Recife, PE"
   ↓
6. Campo é preenchido com "Recife, PE"
   ↓
7. Sistema dispara cálculo de distância automaticamente
```

## 🛠️ Arquivos Modificados

### **1. js/config.js**
- ✅ Adicionada função `setupDynamicAutocomplete()`
- ✅ Implementado sistema de busca com debounce
- ✅ Navegação por teclado (setas, Enter, Escape)
- ✅ Eventos de clique nas sugestões
- ✅ Método `initialize()` centralizado

### **2. js/alternative-apis.js**
- ✅ Adicionada função `searchCities(query, countryCode, limit)`
- ✅ Integração com API Nominatim Search
- ✅ Mapeamento de estados brasileiros (Pernambuco → PE)
- ✅ Formatação automática de nomes

### **3. js/app.js**
- ✅ Atualizado para usar `CONFIG.initialize()`
- ✅ Simplificado processo de inicialização

### **4. index.html**
- ✅ Estrutura de autocomplete com divs de sugestões
- ✅ Link para `autocomplete.css`
- ✅ Placeholders atualizados com exemplos

### **5. css/autocomplete.css**
- ✅ Estilização completa do dropdown
- ✅ Efeitos de hover e active
- ✅ Scrollbar personalizada
- ✅ Responsivo e moderno

## 🌐 API Utilizada

### **OpenStreetMap Nominatim Search API**

```
Endpoint: https://nominatim.openstreetmap.org/search
Parâmetros:
  - q: "Recife" (query de busca)
  - countrycode: "br" (limita ao Brasil)
  - format: "json"
  - addressdetails: 1 (detalhes do endereço)
  - limit: 8 (máximo de resultados)
```

**Características:**
- ✅ **100% Gratuito**
- ✅ **Sem necessidade de chave de API**
- ✅ **Dados atualizados do OpenStreetMap**
- ✅ **Cobertura mundial**

**Requisitos:**
- User-Agent personalizado nas requisições
- Respeitar limite de 1 requisição/segundo
- Uso apenas para testes/desenvolvimento (para produção, considere hospedar próprio Nominatim)

## 🎨 Experiência do Usuário

### **Estados das Sugestões:**

1. **Vazio (< 2 caracteres)**
   - Dropdown escondido

2. **Buscando...**
   ```
   🔍 Buscando cidades...
   ```

3. **Com Resultados**
   ```
   Recife, PE
   cidade
   
   Recanto das Emas, DF
   município
   ```

4. **Sem Resultados**
   ```
   Nenhuma cidade encontrada
   ```

5. **Erro**
   ```
   Erro ao buscar cidades
   ```

## 🚀 Próximos Passos (Opcional)

### **Melhorias Possíveis:**
1. 📍 Cache de buscas recentes (localStorage)
2. 🌍 Botão para alternar entre busca nacional/internacional
3. 📊 Priorização de cidades maiores/mais populares
4. 🔄 Histórico de rotas frequentes
5. 🎯 Detecção de localização atual do usuário

## ⚙️ Configurações

Para alterar o comportamento do autocomplete, edite em `config.js`:

```javascript
// Tempo de debounce (ms)
searchTimeout = setTimeout(..., 300);

// Número de sugestões
const cities = await AlternativeAPIs.searchCities(query, 'br', 8);
                                                           //  ↑
                                                           // Altere aqui

// País padrão
const cities = await AlternativeAPIs.searchCities(query, 'br', 8);
                                                         //  ↑↑
                                                         // 'br', 'us', 'pt', etc.
```

## 🧪 Como Testar

1. Abra `index.html` no navegador
2. Clique no campo **Origem**
3. Digite "Rec"
4. Aguarde as sugestões aparecerem (≈300ms)
5. Use mouse ou teclado para selecionar
6. Repita para o campo **Destino**
7. Veja a distância ser calculada automaticamente! 🎉

## 📝 Notas Importantes

- O autocomplete funciona para **qualquer país** (basta mudar o countryCode)
- Cidades **pequenas e bairros** também aparecem nas sugestões
- O sistema prioriza **cidades e municípios** nos resultados
- A busca é **case-insensitive** (não diferencia maiúsculas/minúsculas)

---

✨ **Pronto!** Agora você tem um sistema de autocomplete moderno e dinâmico, 100% gratuito e sem necessidade de configuração! 🚀
