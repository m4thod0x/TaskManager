require 'test_helper'

class Web::DevelopersControllerTest < ActionController::TestCase
  test 'should get new' do
    get :new
    assert_response :success
  end

  test 'should post create' do
    get :create, params: { developer: attributes_for(:developer) }
    assert_response :redirect
  end
end
