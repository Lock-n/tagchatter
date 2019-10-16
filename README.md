# Resolução desafio TagChatter

Essa é minha resolução do desafio do TagChatter.

## Implementação
Minha implementação se encontra na pasta [src](src), feita com base nos arquivos pré-existentes.

Os dados devem ser obtidos através da [API](#api) e você deve usar o [layout](#layout) como base no desenvolvimento.

### API
Desenvolvemos uma API REST que deve ser usada para obter os dados dos usuários e mensagens.

Você pode acessar as informações detalhadas e testar os endpoints acessando [tagchatter.herokuapp.com/docs](https://tagchatter.herokuapp.com/docs/)

### Layout
Você pode visualizar detalhes do layout [clicando aqui](https://www.figma.com/file/Zhyvatv2GVFm4UcKQlRE4Szs/tagchatter?node-id=0%3A1). Ao criar uma conta no Figma você conseguirá visualizar as medidas e baixar os ícones necessários.

### Requisitos técnicos implementados
1. Na abertura da página a função `getMe()` é chamada, fazendo um request para `/me` recuperando a imagem do usuário e seu id.
2. A lista de mensagens é atualizada a cada 3 segundos, atráves da função `listMessages()`, chamada atráves de `setInterval(listMessages, 3000)`
3. Ao clicar no ícone ![papagaio](parrot.gif) a função `parrotMessage(messageId)` é chamada com o id da mensagem clicada como parâmetro, e então:
   - É feito um request `PUT` para `/messages/:messageId/parrot`
   - A mensagem é destacada na interface, de acordo com o layout
   - O contador de mensagens marcadas como parrot é incrementado
4. Ao clicar no botão enviar, ao lado do campo de texto, é chamada a função `sendMessage(message, authorId)`, com o texto do campo de texto e o id do usuário como parâmetros, então é feito um request para `POST` para `/messages` e, no sucesso da adicão da nova mensagem no servidor, ela é exibida na interface utilizando a função `appendMessage(message)`
5. Se o request para enviar a mensagem falha, é exibido um toast indicando o erro no envio ao usuário.

#### Bônus também foi implementado :star2:
O `unparrot` de mensagens foi implementado na função `unparrotMessage(messageId)`, que é chamada quando o usuário clica no ícone ![papagaio](parrot.gif) de uma mensagem já destacada, fazendo:
1. Um request `PUT` para `/messages/:messageId/unparrot`
2. A remoção do destaque da mensagem na interface (seguindo o layout)
3. A decrementação do contador de mensagens marcadas como parrot.

### Detalhes sobre os requisitos adicionais
- Minha implementação não utiliza nenhum framework adicional
- Utiliza duas bibliotecas Javascript adicionais: jQuery e [Toaststr](https://github.com/CodeSeven/toastr)
- As requisições para a API são feitas client-side e a aplicação consiste somente em uma página.
