# # ####################################################
# # # This script makes a psychTestR implementation of
# # # arithmetic project
# # # Date:2021
# # # Author: Solvej
# # # Project group: X
# # ###################################################


library(htmltools)
library(psychTestR)
library(tibble)
library(shiny)
library(jspsychr)
library(dplyr)
library(tidyverse)
library(readxl)
library(data.table)


#base_dir <- "/Users/Ida/Documents/GitHub/arithmetics/" #Local

#indlæs stimuli - lydfiler
# stimuli<-read_excel(file.path(base_dir,"materiale.xlsx")) #Server
stimuli<-read_excel(file.path(base_dir,"materiale_uden_danske_bogstaver.xlsx")) #Local

#indlæs fillers - lydfiler
# fillers<-read_excel(file.path(base_dir,"fillers.xlsx")) #Server
fillers<-read_excel(file.path(base_dir,"fillers_uden_danske_bogstaver.xlsx")) #Local

jspsych_dir <- file.path(base_dir, "jspsych-6-3-1")

write_to_file <- function(json_object,file_name,var_name=NULL){
  if(is.null(var_name)){
    write(json_object, file=file_name)
  }else{
    write(paste("var ",var_name,"= ", json_object), file=file_name)
  }
}

### STIMULI
# randomize pairing between sentences and math before creating long_stimuli
rand_stimuli <- stimuli
rand_stimuli$sentence <- stimuli$sentence[sample(1:nrow(stimuli))]

long_stimuli <- rand_stimuli %>%
  pivot_longer(
    cols = -c(item,sentence),
    names_to = c(".value","condition"),
    names_pattern = '(.+)_(.+)'
  )

DT_stim <- setDT(long_stimuli)
temp_idx <- DT_stim[,list(idx=sample(.I,1)),by="sentence"]$idx
rand_stimuli <- DT_stim[temp_idx]

### FILLERS
# randomize pairing between filler sentences and math before creating long_fillers
rand_fillers <- fillers
rand_fillers$sentence <- fillers$sentence[sample(1:nrow(fillers))]

long_fillers <- rand_fillers %>%
  pivot_longer(
    cols = -c(item,sentence),
    names_to = c(".value","condition"),
    names_pattern = '(.+)_(.+)'
  )

DT_fill <- setDT(long_fillers)
temp_idx <- DT_fill[,list(idx=sample(.I,1)),by="sentence"]$idx
rand_fillers <- DT_fill[temp_idx]

rand_full <- rbind(rand_stimuli, rand_fillers)
rand_full <- rand_full[sample(nrow(rand_full)),]

math_stim <- data.frame(rand_full,
                        fontsize="32pt",
                        lineheight="normal")

math_stim <- math_stim[1:2,]

# write html definitions to the stimulus column
# note this could be added as a pipe to the above, setting df=.
math_stim$stimulus <- html_stimulus(df = math_stim,
                                      html_content = "math",
                                      html_element = "p",
                                      column_names = c("fontsize","lineheight"),
                                      css = c("font-size", "line-height"),
                                    id = "math")

math_stim$sent_stim <- html_stimulus(df = math_stim,
                                    html_content = "sentence",
                                    html_element = "p",
                                    column_names = c("fontsize","lineheight"),
                                    css = c("font-size", "line-height"),
                                    id = "sentence")

# create json object from dataframe
math_stim_json <- stimulus_df_to_json(df = math_stim,
                                     stimulus = c("stimulus","sent_stim"),
                                     data = c("math","answer","condition"))

# write json object to script
write_to_file(math_stim_json, file.path(base_dir, "test_stimuli.js"), "test_stimuli")

###############################
##### jsPsych starts here #####
###############################


head <- tags$head(
  # jsPsych files


  # If you want to use original jspsych.js, use this:
  includeScript(file.path(jspsych_dir, "jspsych.js")),

  # If you want to display text while preloading files (to save time), specify your intro_text
  # in jsPsych.init (in run-jspsych.js) and call jspsych_preloadprogressbar.js here:
  # includeScript(file.path(jspsych_dir, "plugins/jspsych_preloadprogressbar.js")),

  includeScript(
    file.path(jspsych_dir, "plugins/jspsych-html-button-response.js")
  ),

  includeScript(
    file.path(jspsych_dir, "plugins/jspsych-html-keyboard-response.js")
  ),

  includeScript(
    file.path(jspsych_dir, "plugins/jspsych-fullscreen.js")
  ),

  includeScript(
    file.path(jspsych_dir, "plugins/jspsych-survey-text.js")
  ),

  includeScript(
    file.path(jspsych_dir, "plugins/jspsych-survey-multi-choice.js")
  ),

  includeScript(
    file.path(jspsych_dir, "plugins/jspsych-survey-html-form.js")
  ),

  includeScript(
    file.path(jspsych_dir, "plugins/jspsych-instructions.js")
  ),

  # Custom files
  includeCSS(file.path(jspsych_dir, "css/jspsych.css"))
)

#########

##Consent form
ui_consent <- tags$div(
  head,
  includeScript(file.path(base_dir, "consent-timeline.js")),
  includeScript(file.path(base_dir, "run-jspsych_full.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

consent <- page(
  ui = ui_consent,
  label = "consent",
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Instructions
ui_instr <- tags$div(
  head,
  includeScript(file.path(base_dir, "instr-timeline.js")),
  includeScript(file.path(base_dir, "run-jspsych_full.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

instr <- page(
  ui = ui_instr,
  label = "instr",
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Math instructions
ui_math_instr <- tags$div(
  head,
  includeScript(file.path(base_dir, "math_instr.js")),
  includeScript(file.path(base_dir, "run-jspsych_full.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

math_instr <- page(
  ui = ui_math_instr,
  label = "math_instr",
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Test
ui_test <- tags$div(
  head,
  includeScript(file.path(base_dir, "test_stimuli.js")),
  includeScript(file.path(base_dir, "test-01-timeline.js")),
  includeScript(file.path(base_dir, "run-jspsych.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

test <- page(
  ui = ui_test,
  label = "test",
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Age and education
ui_demographics <- tags$div(
  head,
  includeScript(file.path(base_dir, "demographics-timeline.js")),
  includeScript(file.path(base_dir, "run-jspsych_full.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

demographics <- page(
  ui = ui_demographics,
  label = 'demographics',
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Gender
ui_gender <- tags$div(
  head,
  includeScript(file.path(base_dir, "gender-timeline.js")),
  includeScript(file.path(base_dir, "run-jspsych_full.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

gender <- page(
  ui = ui_gender,
  label = 'gender',
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Native language
ui_nativelang <- tags$div(
  head,
  includeScript(file.path(base_dir, "native-language-timeline.js")),
  includeScript(file.path(base_dir, "run-jspsych_full.js")),
  # includeScript(file.path(base_dir, "run-jspsych.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

nativelang <- page(
  ui = ui_nativelang,
  label = "nativelang",
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Dyslexia
ui_dyslexia <- tags$div(
  head,
  includeScript(file.path(base_dir, "dyslexia-timeline.js")),
  includeScript(file.path(base_dir, "run-jspsych_full.js")),
  # includeScript(file.path(base_dir, "run-jspsych.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

dyslexia <- page(
  ui = ui_dyslexia,
  label = "dyslexia",
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Email
ui_email <- tags$div(
  head,
  includeScript(file.path(base_dir, "email-timeline.js")),
  includeScript(file.path(base_dir, "run-jspsych_full.js")),
  tags$div(id = "js_psych", style = "min-height: 90vh")
)

email <- page(
  ui = ui_email,
  label = 'email',
  get_answer = function(input, ...)
    input$jspsych_results,
  validate = function(answer, ...)
    nchar(answer) > 0L,
  save_answer = TRUE
)

##Final
final <- final_page(tags$div(
  tags$p("Igen tusind tak for din deltagelse!"),
  tags$p("Du kan lukke din browser nu.")
  # tags$p("Thx for participating!"),
  # tags$p("You may now close your browser.")
))

##elts
elts <- join(
  consent,
  gender,
  demographics,
  nativelang,
  #dyslexia,
  math_instr,
  instr,
  test,
  # elt_save_results_to_disk(complete = FALSE), # anything that is saved here counts as completed
  elt_save_results_to_disk(complete = TRUE),
  email,
  final
)

##exp
exp <- make_test(
  elts = elts,
  opt = test_options(title="arithmetics test, Aarhus 2021",
                     admin_password="", # write a secret password here
                     enable_admin_panel=TRUE,
                     researcher_email="solvej.kjaer@gmail.com",
                     display = display_options(
                       full_screen = TRUE,
                       css = file.path(jspsych_dir, "css/jspsych.css")
                     )))

#shiny::runApp(".")
