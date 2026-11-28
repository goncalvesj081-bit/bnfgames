'use strict';
/* SUITS · dados: listas comuns dos casos e o registro TPL
   Scripts clássicos compartilham o escopo global (carregados em ordem pelo suits.html).
   Mapa do código e regras: CLAUDE.md na raiz do repositório. */
/* ================================================================
   CASOS — cada template gera um processo com variáveis sorteadas.
   Para criar um caso novo numa atualização: copie um template,
   mude os textos e registre em TPL. O motor cuida do resto.
================================================================= */
const QUAL=[{l:'Nome e prenome',ok:1},{l:'Estado civil e existência de união estável',ok:1},{l:'Profissão',ok:1},{l:'CPF ou CNPJ',ok:1},{l:'Endereço eletrônico',ok:1},{l:'Domicílio e residência',ok:1},{l:'Religião',ok:0},{l:'Renda mensal',ok:0},{l:'Nome dos filhos',ok:0}];
const EMP_TEL=['Conecta Mais Telefonia S.A.','Vivaz Telecom S.A.','Linha Azul Telecomunicações S.A.','Sinal Forte Telefonia S.A.'];
const LOJAS=['Casa Bonfim','Magazine Estrela','Lojas Primavera','Móveis Aliança'];
const PLANOS=['Vida Plena Saúde','Cuidar+ Assistência Médica','Bem Viver Saúde','Saúde Integral S.A.'];
const ITENS=['uma geladeira','um fogão','uma máquina de lavar','um guarda-roupa','um colchão de casal'];
const QUEM=[['neta','a'],['neto','o'],['filha','a'],['sobrinha','a']];
const ITEM=c=>c.v.item||'uma geladeira';
const ITEMN=c=>ITEM(c).replace(/^uma? /,'');
const WREL={cunhada:{fala:'"Sou cunhada dele. Irmã da esposa."',ok:'contra',fb:'Cunhada é colateral por afinidade em 2º grau: impedida (art. 447, §2º, I). Será ouvida, no máximo, como informante, sem compromisso.',a:['CPC-457','CPC-447']},
  amiga:{fala:'"Somos amigos há vinte anos. Ele é padrinho do meu filho."',ok:'contra',fb:'Amiga íntima é testemunha suspeita (art. 447, §3º, I). Contraditada, será ouvida, no máximo, como informante.',a:['CPC-457','CPC-447']},
  prima:{fala:'"Sou prima dele. Filha de um tio."',ok:'nao',fb:'Prima é colateral em 4º grau: não está entre os impedidos, que vão até o 3º grau (art. 447, §2º, I). A contradita seria rejeitada. O caminho é perguntar e explorar contradições.',a:['CPC-447']}};
const WR=c=>WREL[c.v.wrel]||WREL.cunhada;
const FARM=c=>isF(c.v.testR)?'a farmacêutica':'o farmacêutico';
const VEHS={moto:{prof:'motoboy de entregas',n:'moto',a:'a',chega:'de jaqueta e capacete na mão, direto de uma entrega',queda:'me jogou no chão',dono:'o motoqueiro'},
  carro:{prof:'motorista de aplicativo',n:'carro',a:'o',chega:'com o celular do aplicativo ainda apitando corrida',queda:'me fechou e eu bati na lateral dele',dono:'o motorista do aplicativo'},
  van:{prof:'eletricista autônomo',n:'van',a:'a',chega:'de uniforme sujo de graxa, direto de um serviço',queda:'me acertou de lado',dono:'o motorista da van'}};
const VEH=c=>VEHS[c.v.veh]||VEHS.moto;
const PROCS=[{n:'cirurgia cardíaca',d:'uma cardiopatia congênita'},{n:'cirurgia de correção da coluna',d:'uma escoliose que está apertando os pulmões'},{n:'cirurgia para retirar um tumor',d:'um tumor benigno que não para de crescer'},{n:'cirurgia renal',d:'uma malformação no rim esquerdo'}];
const cirD=c=>c.v.cirD||addD(c.start,c.v.dias||15);
const QUALM=QUAL.concat([{l:'Qualificação do representante legal (a mãe)',ok:1}]);
const PROC=c=>PROCS[c.v.proc||0];
/* atq: perguntas do atendimento. f = fato escondido; em cada caso, só UMA das
   perguntas candidatas a um fato faz o cliente lembrar (sorteada em buildAtq). */
const TPL={};
const TPL_ORDER=['neg','acid','saude'];

