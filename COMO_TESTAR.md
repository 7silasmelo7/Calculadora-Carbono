# 🧪 Como Testar o Autocomplete Dinâmico

## 📋 Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet (para acessar API do OpenStreetMap)

## 🚀 Passos para Testar

### 1. Abrir o Projeto
Abra o arquivo `index.html` no seu navegador:
- **Opção 1**: Clique duas vezes no arquivo `index.html`
- **Opção 2**: Arraste o arquivo para o navegador
- **Opção 3**: Use Live Server no VS Code (clique direito > Open with Live Server)

### 2. Testar Autocomplete de Origem

1. Clique no campo **"Origem"**
2. Digite **"Rec"**
3. Aguarde ~300ms
4. Você verá aparecer:
   ```
   Recife, PE
   cidade
   
   Recanto das Emas, DF
   município
   
   Recreio, MG
   cidade
   ```

### 3. Selecionar Cidade

**Com o Mouse:**
- Clique na cidade desejada (ex: "Recife, PE")
- O campo será preenchido automaticamente

**Com o Teclado:**
- Use ⬇️ para navegar entre as sugestões
- A sugestão ativa fica com fundo verde claro
- Pressione ↩️ **Enter** para selecionar
- Pressione ⎋ **Escape** para fechar

### 4. Testar Autocomplete de Destino

1. Clique no campo **"Destino"**
2. Digite **"Nat"**
3. Aguarde as sugestões aparecerem
4. Selecione "Natal, RN"

### 5. Verificar Cálculo Automático

Após selecionar origem e destino:
- O campo **"Distância (km)"** será preenchido automaticamente
- Você verá a mensagem: "🔍 Calculando distância via OpenStreetMap..."
- Depois aparecerá: "✅ Distância encontrada: XXX km (linha reta)"

### 6. Testar com Outras Cidades

**Cidades Grandes:**
- São Paulo
- Rio de Janeiro
- Brasília
- Salvador
- Fortaleza
- Belo Horizonte

**Cidades Médias:**
- Campinas
- Santos
- Ribeirão Preto
- Juiz de Fora
- Joinville

**Cidades Pequenas:**
- Garanhuns, PE
- Caruaru, PE
- Petrolina, PE

## 🔍 O Que Observar

### Console do Navegador
Abra o Console (F12 > Console) para ver os logs:
```
🚀 Inicializando Calculadora de Carbono...
✅ Autocomplete dinâmico configurado!
✅ Calculadora de Carbono inicializada!
ℹ️ Usando apenas OpenStreetMap para distâncias e cidades

🔍 Buscando cidades: "Rec" (BR)
✅ Encontradas 8 cidades

🔍 Geocodificando 'Recife, PE'...
✅ Recife, PE encontrado: -8.0578, -34.8831

🔍 Geocodificando 'Natal, RN'...
✅ Natal, RN encontrado: -5.7945, -35.2110

📏 Distância (Haversine): 286.45 km
```

### Comportamentos Esperados

✅ **Busca inicia após 2 caracteres**
- Digite "R" → nada acontece
- Digite "Re" → busca é iniciada

✅ **Debounce de 300ms**
- Se você digitar rapidamente "Recife", só fará 1 busca (não 6)

✅ **Loading aparece**
- Mensagem "🔍 Buscando cidades..." enquanto busca

✅ **Formatação brasileira**
- Cidades aparecem como "Recife, PE" (não "Recife, Pernambuco, Brasil")

✅ **Dropdown fecha ao clicar fora**
- Clique em qualquer lugar da página → dropdown fecha

✅ **Cálculo automático de distância**
- Ao selecionar ambas as cidades → distância é calculada automaticamente

## ❌ Possíveis Problemas e Soluções

### Problema 1: "Erro ao buscar cidades"
**Causa**: Sem conexão com internet ou API do OpenStreetMap fora do ar
**Solução**: 
- Verifique sua conexão
- Tente novamente em alguns segundos

### Problema 2: "Nenhuma cidade encontrada"
**Causa**: Nome da cidade incorreto ou muito genérico
**Solução**: 
- Digite mais caracteres (ex: "Gara" em vez de "Gar")
- Verifique a ortografia

### Problema 3: Autocomplete não aparece
**Causa**: JavaScript não carregado ou erro no console
**Solução**: 
- Abra o Console (F12)
- Procure por erros em vermelho
- Recarregue a página (Ctrl+R ou F5)

### Problema 4: Distância não calcula automaticamente
**Causa**: Campo de distância está em modo manual
**Solução**: 
- Desmarque a checkbox "Informar distância manualmente"
- Selecione as cidades novamente

## 🎯 Casos de Teste Avançados

### Teste 1: Cidades com Nomes Similares
Digite "Santo" e veja:
- Santo André, SP
- Santos, SP
- Santo Antônio de Jesus, BA

### Teste 2: Cidades Pequenas
Digite "Garanhuns" e veja:
- Garanhuns, PE

### Teste 3: Navegação por Teclado
1. Digite "São"
2. Use ⬇️ para ir até "São Paulo, SP"
3. Use ⬆️ para voltar
4. Pressione ↩️ para selecionar
5. Pressione ⎋ para cancelar

### Teste 4: Busca Rápida
Digite rapidamente "Recife" e observe:
- Apenas 1 requisição é feita (não 6)
- Debounce está funcionando

### Teste 5: Cidades Internacionais (se desejar)
Mude o countryCode em `config.js`:
```javascript
const cities = await AlternativeAPIs.searchCities(query, 'us', 8);
```
Agora teste com cidades americanas:
- New York
- Los Angeles
- Chicago

## 📊 Métricas de Performance

**Tempo de Resposta Esperado:**
- Digitação → Busca: ~300ms (debounce)
- Busca → Resultados: ~500-1000ms (dependendo da API)
- Seleção → Cálculo de Distância: ~1-2s

**Número de Requisições:**
- Digitando "Recife": 1 requisição (graças ao debounce)
- Digitando "R-e-c-i-f-e" lentamente: até 5 requisições

## 🎉 Sucesso!

Se você conseguiu:
- ✅ Ver sugestões de cidades ao digitar
- ✅ Selecionar uma cidade com mouse ou teclado
- ✅ Campo de distância preenchido automaticamente
- ✅ Cálculo de emissão de CO₂ funcionando

**Parabéns! O autocomplete dinâmico está funcionando perfeitamente! 🚀**

---

**Dúvidas?** Consulte o arquivo [AUTOCOMPLETE_DINAMICO.md](AUTOCOMPLETE_DINAMICO.md) para mais detalhes técnicos.
