(function(apiUrl) {
  var userId;

  function appendMessage(message) {
    var messageDiv = $("<div>", {
      class: "messages__message" +
      (message.has_parrot ?
        " active"
        :
        ""),
      id: message.id
    });

    // Adiciona a div do avatar
    var avatarDiv = $("<div>", {
      class: "messages__message__avatar",
      style: "content: url('" + message.author.avatar + "')"
    });

    messageDiv.append(avatarDiv);

    // Adiciona a div do conteudo
    var contentDiv = $("<div>", {
      class: "messages__message__content"
    });

    var contentHeaderDiv = $("<div>", {
      class: "messages__message__content__header"
    });

    contentHeaderDiv.append(
      $("<span>", {
        class: "messages__message__content__header__username"
      }).text(message.author.name)
    );

    contentHeaderDiv.append(
      $("<span>", {
        class: "messages__message__content__header__separator"
      }).text("●")
    );

    var messageSentDate = new Date(message.created_at);
    var formatedDateMinutes = String(messageSentDate.getMinutes());
    var formatedDateHours = String(messageSentDate.getHours());

    if (formatedDateMinutes.length == 1)
      formatedDateMinutes = '0' + formatedDateMinutes;

    if (formatedDateHours.length == 1)
      formatedDateHours = '0' + formatedDateHours;

    contentHeaderDiv.append(
      $("<span>", {
        class: "messages__message__content__header__time"
      }).text(formatedDateHours + ':' + formatedDateMinutes)
    );

    contentHeaderDiv.append(
      $("<span>", {
        class: "messages__message__content__header__separator"
      }).text("●")
    );

    contentHeaderDiv.append(
      $("<div>", {
        class: "messages__message__content__header__image " + 
        (message.has_parrot ? 
          "messages__message__content__header__image-red-parrot" :
          "messages__message__content__header__image-gray-parrot") 
      }).on("click", (message.has_parrot ?
        function() {unparrotMessage($(this).parent().parent().parent().attr("id"));}
        :
        function() {parrotMessage($(this).parent().parent().parent().attr("id"));}
        ))
    );

    contentDiv.append(contentHeaderDiv);

    contentDiv.append(
      $("<div>", {
        class: "messages__message__content__body"
      }).text(message.content)
    );
    messageDiv.append(contentDiv);

    $(".messages").append(messageDiv);
  }

  function fetchParrotsCount() {
    return fetch(apiUrl + "/messages/parrots-count")
      .then(function(response) {
        if (response.ok)
          return response.json();
        else
          return new Promise.reject(response.status);
      })
      .then(function(count) {
        document.getElementById("parrots-counter").innerHTML = count;
      })
      .catch(function(statusCode) {
        toastr.warning("Erro na recuperação do número de mensagens marcadas como parrot." + 
        (typeof(statusCode) == Number ?
        " Código de erro: " + statusCode
        :
        ""));
      });;
  }

  function listMessages() {
    // Faz um request para a API de listagem de mensagens
    // Atualiza o conteúdo da lista de mensagens
    // Deve ser chamado a cada 3 segundos

    return fetch(apiUrl + "/messages").then(function(response) {
      if (response.ok)
        return response.json();
      else
        return new Promise.reject(response.status)
    })
    .then(function(messages) {
      var isFirstCall = $(".messages").html().trim() === "";

      // Exibe gif de carregamento e esconde div das mensagens
      $(".messages_loading_bar").css("display","block");
      $(".messages").css("display","none");

      $(".messages").html("");

      for (var i = 0; i < messages.length; i++) {
        appendMessage(messages[i]);
      }

      // Esconde gif de carregamento e exibe div das mensagens
      $(".messages_loading_bar").css("display","none");
      $(".messages").css("display","block");

      if (isFirstCall) {
        $(".messages").stop().animate({
          scrollTop: $('.messages')[0].scrollHeight
        }, 800);
      }
      else {
        $(".messages").scrollTop($(".messages")[0].scrollHeight);
      }
    })
    .catch(function(statusCode) {
      toastr.warning("Erro na atualização da lista de mensagens." + 
      (typeof(statusCode) == Number ?
      " Código de erro: " + statusCode
      :
      ""));
    });
  }

  function parrotMessage(messageId) {
    // Faz um request para marcar a mensagem como parrot no servidor
    // Altera a mensagem na lista para que ela apareça como parrot na interface

    return fetch(apiUrl + "/messages/" + messageId + "/parrot", {
      method: "PUT"
    })
    .then(function(response) {
      if (response.ok)
        return response.json();
      else
        return new Promise.reject();
    })
    .then(function(message) {
      $("#" + messageId).addClass("active").find(".messages__message__content__header__image-gray-parrot")
      .attr("class", "messages__message__content__header__image messages__message__content__header__image-red-parrot");

      // Incrementa o contador de mensagens parrot
      $("#parrots-counter").html(parseInt($("#parrots-counter").html()) + 1);
    })
    .catch(function() {
      toastr.error("Um erro ocorreu durante a marcação da mensagem como parrot, por favor tente novamente.");
    });
  }

  function unparrotMessage(messageId) {
    // Faz um request para desmarcar a mensagem como parrot no servidor
    // Altera a mensagem na lista para que ela apareça como não parrot na interface

    return fetch(apiUrl + "/messages/" + messageId + "/unparrot", {
      method: "PUT"
    })
    .then(function(response) {
      if (response.ok)
        return response.json();
      else
        return new Promise.reject();
    })
    .then(function(message) {
      $("#" + messageId).removeClass("active").find(".messages__message__content__header__image-red-parrot")
      .attr("class", "messages__message__content__header__image messages__message__content__header__image-gray-parrot");

      // Decrementa o contador de mensagens parrot
      $("#parrots-counter").html(parseInt($("#parrots-counter").html()) - 1);
    })
    .catch(function() {
      toastr.error("Um erro ocorreu durante a desmarcação da mensagem como parrot, por favor tente novamente.");
    });
  }

  function sendMessage(message, authorId) {
    // Manda a mensagem para a API quando o usuário envia a mensagem
    // Caso o request falhe exibe uma mensagem para o usuário utilizando Window.alert ou outro componente visual
    // Se o request for bem sucedido, atualiza o conteúdo da lista de mensagens

    return fetch(apiUrl + "/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        author_id: authorId
      })
    })
    .then(function(response) {
      if (response.ok)
        return response.json();
      else {
        return Promise.reject(response);
      }
    })
    .then(function(message) {
      toastr.success("Mensagem enviada.");
      appendMessage(message);

      // Desce o scroll até o fim para visualizar a mensagem enviada
      $(".messages").scrollTop($(".messages")[0].scrollHeight);
    })
    .catch(function(response) {
      if (typeof(response) == Promise) {
        if ([400, 404, 500].includes(response.status)) {
          response.json().then(function(json) {
            toastr.error("Erro inesperado ao enviar a mensagem.<br>Código: " + response.status + "<br>Mensagem: " + json.error);
          });
        }
        else {
          toastr.error("Erro inesperado ao enviar a mensagem.<br>Código: " + response.status);
        }
      }
      else {
        toastr.error("Erro inesperado ao enviar a mensagem.");
      }
    });
  }

  function getMe() {
    // Faz um request para pegar os dados do usuário atual
    // Exibe a foto do usuário atual na tela e armazena o seu ID para quando ele enviar uma mensagem

    return fetch(apiUrl + "/me").then(function(response) {
      if (response.ok)
        return response.json();
      else
        return Promise.reject();
    })
    .then(function(userInfo) {
      userId = userInfo.id;
      $(".send_messages__wrapper__avatar").css({"content": "url('" + userInfo.avatar + "')"});
    })
    .catch(function() {
      toastr.error("Um erro ocorreu durante a recuperação de seus dados, por favor recarregue a página.");

      throw new Error("Falha na recuperação dos dados do usuário.");
    });
  }

  function initialize() {
    fetchParrotsCount();
    getMe();

    // Lista as mensagens imediatamente, e depois as atualiza a cada 3 segundos
    listMessages();
    setInterval(listMessages, 3000);

    $(".send_messages__wrapper__send_button").on("click", function() {
      var input_text = $(this).parent().find("input").val();
      if (input_text !== "")
        sendMessage(input_text, userId);
      else
        toastr.info("Mensagens vazias não são enviadas.");
    });

    $(".send_messages__wrapper__form").on("submit", function() {
      $(".send_messages__wrapper__send_button").click();
      return false;
    });
  }

  initialize();
})("http://localhost:3000");