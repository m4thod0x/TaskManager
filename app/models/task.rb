class Task < ApplicationRecord
  belongs_to :author, class_name: 'User'
  belongs_to :assignee, class_name: 'User', optional: true

  validates :name, presence: true
  validates :description, presence: true
  validates :author_id, presence: true
  validates :description, length: { maximum: 500 }

  state_machine :state, initial: :new_task do
    event :develope do
      transition [:new_task, :in_qa, :in_code_review] => :in_development
    end

    event :to_qa do
      transition in_development: :in_qa
    end

    event :code_review do
      transition in_qa: :in_code_review
    end

    event :for_realise do
      transition in_code_review: :ready_for_realise
    end

    event :realise do
      transition ready_for_realise: :realised
    end

    event :archive do
      transition [:new_task, :realised] => :archived
    end
  end
end
